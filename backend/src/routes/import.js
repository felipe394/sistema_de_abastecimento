const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

// POST /api/import
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Data format assumed: { Date: 'YYYY-MM-DD', Custody: 'Name', ATM: '1234', Type: 'deposit|withdrawal', Amount: 1000.50 }
    
    // Start a transaction as we are doing multiple inserts
    await db.transaction(async trx => {
      for (const row of data) {
        if (!row.Custody || !row.ATM || !row.Date || !row.Type || !row.Amount) continue;

        // Ensure Custody exists
        let custody = await trx('tb_custodias').where({ name: row.Custody }).first();
        if (!custody) {
          const [id] = await trx('tb_custodias').insert({ name: row.Custody });
          custody = { id, name: row.Custody };
        }

        // Ensure ATM exists
        let atm = await trx('tb_atms').where({ number: row.ATM.toString() }).first();
        if (!atm) {
          const [id] = await trx('tb_atms').insert({
            number: row.ATM.toString(),
            custody_id: custody.id
          });
          atm = { id, number: row.ATM.toString(), custody_id: custody.id };
        }

        // Parse date (assuming valid format or excel serialized date)
        let parsedDate = row.Date;
        if (typeof row.Date === 'number') {
          // Excel date to JS date
          parsedDate = new Date((row.Date - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0];
        }

        // Insert Transaction
        await trx('tb_transacoes').insert({
          atm_id: atm.id,
          date: parsedDate,
          type: row.Type.toLowerCase() === 'deposit' ? 'deposit' : 'withdrawal',
          amount: parseFloat(row.Amount)
        });
      }
    });

    res.json({ message: 'Importação realizada com sucesso', recordsProcessed: data.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao processar o arquivo' });
  }
});

module.exports = router;
