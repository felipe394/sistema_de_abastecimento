const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
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
    const filenameOriginal = req.file.originalname;
    const filename = filenameOriginal.toLowerCase();
    
    // Check if it's text based on extension or mimetype
    const isTextFallback = filename.endsWith('.txt') || filename.endsWith('.csv') || req.file.mimetype.includes('text') || !filename.includes('.');

    let isTextFormat = false;

    if (isTextFallback) {
        // Read file to inspect
        const previewContent = fs.readFileSync(req.file.path, 'utf8').substring(0, 100);
        if (previewContent.includes('H:') || previewContent.includes('D:') || previewContent.includes(';')) {
            isTextFormat = true;
        }
    }

    if (isTextFormat) {
      // Process legacy text file format
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const lines = fileContent.split(/\r?\n/);
      let recordsProcessed = 0;
      let skippedLines = 0;

      const atmRows = await db('tb_atms').select('id', 'numero');
      const atmMap = new Map();
      atmRows.forEach(a => atmMap.set(a.numero, a.id));
      
      let defaultCustodyId = null;
      let maxDate = null;
      const transactionsToInsert = [];

      await db.transaction(async trx => {
        // Discard first and last line
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || !line.startsWith('D:')) continue; // skips trailers and headers automatically!

          // Expected line format: D:ATMCODE               ;DateHour;DateContabil;ControleContabil;Tipo                                              ;Valor;NSU;...
          const parts = line.split(';');
          if (parts.length < 6) continue;
          
          const firstPart = parts[0] || '';
          const atmCode = firstPart.substring(2).trim(); // Remove "D:" and trim spaces
          const dataHoraStr = parts[1] ? parts[1].trim() : '';
          const dataContabilStr = parts[2] ? parts[2].trim() : '';
          const controleContabil = parts[3] ? parts[3].trim() : '';
          const tipo = parts[4] ? parts[4].trim() : '';
          const valorStr = parts[5] ? parts[5].trim() : '';
          const nsu = parts[6] ? parts[6].trim() : '';

          if (!atmCode || !dataHoraStr || !dataContabilStr || !tipo || !valorStr) {
            skippedLines++;
            continue;
          }

          // Rule: discard if accounting date (day) ends in 31
          if (dataContabilStr.endsWith('31')) {
            skippedLines++;
            continue;
          }

          // Format amount
          const amount = parseFloat(valorStr) / 100;

          // Parse transaction type
          let transactionType = 'saque'; // Default to saque (SAQUE)
          if (tipo.toUpperCase() === 'SAQUE') transactionType = 'saque';
          else if (tipo.toUpperCase() === 'DEPOSITO') transactionType = 'deposito';

          // Format DataHora da transação
          let transactionDatetime = null;
          if (dataHoraStr.length >= 14) {
            transactionDatetime = `${dataHoraStr.substring(0,4)}-${dataHoraStr.substring(4,6)}-${dataHoraStr.substring(6,8)} ${dataHoraStr.substring(8,10)}:${dataHoraStr.substring(10,12)}:${dataHoraStr.substring(12,14)}`;
          }

          // Format Data contábil (Used as reference date)
          let accountingDate = null;
          if (dataContabilStr.length >= 8) {
            accountingDate = `${dataContabilStr.substring(0,4)}-${dataContabilStr.substring(4,6)}-${dataContabilStr.substring(6,8)}`;
          }

          // Ensure ATM exists
          let atmId = atmMap.get(atmCode);
          if (!atmId) {
             if (!defaultCustodyId) {
                const custody = await trx('tb_custodias').first();
                if (!custody) {
                   const [cId] = await trx('tb_custodias').insert({ nome: 'Custódia Padrão' });
                   defaultCustodyId = cId;
                } else {
                   defaultCustodyId = custody.id;
                }
             }
             const [newAtmId] = await trx('tb_atms').insert({
                numero: atmCode,
                id_custodia: defaultCustodyId
             });
             atmId = newAtmId;
             atmMap.set(atmCode, newAtmId);
          }

          transactionsToInsert.push({
            id_atm: atmId,
            valor: amount,
            tipo: transactionType,
            data_hora_transacao: transactionDatetime,
            data_contabil: accountingDate,
            controle_contabil: controleContabil.substring(0, 15),
            nsu: nsu.substring(0, 6),
            data: accountingDate,
            nome_arquivo: filenameOriginal
          });

          if (accountingDate && (!maxDate || accountingDate > maxDate)) {
             maxDate = accountingDate;
          }
          recordsProcessed++;
        }
        
        // Batch insert processing
        const chunkSize = 1500;
        for (let i = 0; i < transactionsToInsert.length; i += chunkSize) {
           await trx('tb_transacoes').insert(transactionsToInsert.slice(i, i + chunkSize));
        }
      });
      
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      
      const referMsg = maxDate ? maxDate.split('-').reverse().join('/') : '';
      return res.json({ 
        message: `✅ Importação concluída!\nVeja a data de referência ${referMsg} na tela de análise de ATMs.`, 
        recordsProcessed, 
        skippedLines 
      });

    } else {
      // Excel logic
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      await db.transaction(async trx => {
        for (const row of data) {
          if (!row.Custody || !row.ATM || !row.Date || !row.Type || !row.Amount) continue;

          let custody = await trx('tb_custodias').where({ nome: row.Custody }).first();
          if (!custody) {
            const [id] = await trx('tb_custodias').insert({ nome: row.Custody });
            custody = { id, name: row.Custody };
          }

          let atm = await trx('tb_atms').where({ numero: row.ATM.toString() }).first();
          if (!atm) {
            const [id] = await trx('tb_atms').insert({ numero: row.ATM.toString(), id_custodia: custody.id });
            atm = { id, number: row.ATM.toString(), custody_id: custody.id };
          }

          let parsedDate = row.Date;
          if (typeof row.Date === 'number') {
            parsedDate = new Date((row.Date - (25567 + 2)) * 86400 * 1000).toISOString().split('T')[0];
          }

          await trx('tb_transacoes').insert({
            id_atm: atm.id,
            data: parsedDate,
            tipo: row.Type.toLowerCase() === 'deposit' ? 'deposito' : 'saque',
            valor: parseFloat(row.Amount),
            nome_arquivo: filenameOriginal
          });
        }
      });

      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.json({ message: 'Importação realizada com sucesso', recordsProcessed: data.length });
    }
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Erro ao processar o arquivo: ' + ((err && err.message) ? err.message : '') });
  }
});

module.exports = router;
