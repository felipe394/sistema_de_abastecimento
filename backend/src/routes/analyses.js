const express = require('express');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');
const PDFDocument = require('pdfkit');
const xlsx = require('xlsx');

const router = express.Router();
router.use(authMiddleware);

// Helper function to extract ATM prediction logic, reused by /detail, /export/pdf, and /export/excel
async function getDetailData(custodyId, referenceDate) {
  const analysis = await db('tb_analises')
    .where({ id_custodia: custodyId, data_referencia: referenceDate })
    .first();

  if (!analysis) {
    throw new Error('Nenhuma análise salva encontrada para esta data');
  }

  const config = typeof analysis.configuracao === 'string' ? JSON.parse(analysis.configuracao) : analysis.configuracao;
  const { lines, dateRows, actionFinalMacro, actionFinalMicro } = config;

  const atms = await db('tb_atms').where({ id_custodia: custodyId });
  const allDates = Object.values(dateRows).flat().map(d => d.date).filter(Boolean);
  const uniqueDates = [...new Set(allDates)];
  
  const transactions = await db('tb_transacoes')
    .where({ id_atm: atms.map(a => a.id) })
    .whereIn('data', uniqueDates);

  const getAtmPrediction = (atmId, type) => {
    const rowValues = lines
      .filter(row => row.macro)
      .map(row => {
        const rowDates = dateRows[row.id] || [];
        const dailyValues = rowDates.map(rd => {
          const trans = transactions.find(t => t.id_atm === atmId && t.data.toISOString().split('T')[0] === rd.date);
          const baseAmount = trans ? (type === 'W' ? trans.valor : trans.valor) : 0; // Wait, if type is W should it be withdrawal? 
          // Actually, in the original code: trans ? (type === 'W' ? trans.withdrawal : trans.deposit) : 0;
          // But I need to handle types!
          
          // Let's refine this to filter by tipo.
          const transValue = transactions.find(t => t.id_atm === atmId && t.data.toISOString().split('T')[0] === rd.date && t.tipo === (type === 'W' ? 'saque' : 'deposito'));
          const baseAmountVal = transValue ? transValue.valor : 0;
          
          const factorString = type === 'W' ? rd.factorW : rd.factorD;
          const factor = parseFloat(factorString.replace(',', '.')) || 1;
          return baseAmountVal * factor;
        });

        if (dailyValues.length === 0) return 0;
        switch (row.action) {
          case 'Maior': return Math.max(...dailyValues);
          case 'Menor': return Math.min(...dailyValues);
          case 'Média': return dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
          case 'Soma': return dailyValues.reduce((a, b) => a + b, 0);
          default: return 0;
        }
      });

    if (rowValues.length === 0) return 0;
    switch (actionFinalMacro) {
      case 'Maior': return Math.max(...rowValues);
      case 'Menor': return Math.min(...rowValues);
      case 'Média': return rowValues.reduce((a, b) => a + b, 0) / rowValues.length;
      case 'Soma': return rowValues.reduce((a, b) => a + b, 0);
      default: return 0;
    }
  };

  const results = atms.map(atm => ({
    id: atm.numero,
    name: `ATM ${atm.numero}`,
    withdrawal: getAtmPrediction(atm.id, 'W'),
    deposit: getAtmPrediction(atm.id, 'D'),
  }));

  const custody = await db('tb_custodias').where({ id: custodyId }).first();

  return { custody, referenceDate, atms: results };
}


// POST /api/analyses/calculate
// Calculates the prediction index based on the user's configuration
router.post('/calculate', async (req, res) => {
  const { custodyId, referenceDate, lines, actionFinalMacro, actionFinalMicro } = req.body;
  if (!custodyId || !referenceDate || !lines) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    // Basic structured response for calculation (simplified logic for now)
    // In reality, this queries all `transactions` for the given custody and dates,
    // applies the line factors, groups by action (Maior, Media, etc), and calculates
    // the final % index diff between calculated macro and individual sums.
    
    // For scaffolding purposes, we simulate the calculation:
    const atms = await db('tb_atms').where({ id_custodia: custodyId });
    
    // Return mock calculated index and individual ATM adjustments
    const simulationIndex = 1.02; // e.g. 2% more
    const results = atms.map(atm => ({
      atmId: atm.id,
      atmNumber: atm.numero,
      originalPrediction: 10000, 
      adjustedPrediction: 10000 * simulationIndex
    }));

    res.json({
      custodyId,
      referenceDate,
      calculatedIndex: simulationIndex,
      macroPrediction: 500000,
      microSum: 490196,
      details: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha no cálculo' });
  }
});

// GET /api/analyses
// Fetch a saved analysis for a specific custody and date
router.get('/', async (req, res) => {
  const { custodyId, referenceDate } = req.query;
  if (!custodyId || !referenceDate) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const analysis = await db('tb_analises')
      .where({ id_custodia: custodyId, data_referencia: referenceDate })
      .first();
    
    if (analysis && analysis.configuracao) {
      return res.json(typeof analysis.configuracao === 'string' ? JSON.parse(analysis.configuracao) : analysis.configuracao);
    }
    res.json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao buscar análise' });
  }
});

// POST /api/analyses
// Save or Update an analysis
router.post('/', async (req, res) => {
  const { custodyId, referenceDate, config } = req.body;
  try {
    const existing = await db('tb_analises')
      .where({ id_custodia: custodyId, data_referencia: referenceDate })
      .first();

    if (existing) {
      await db('tb_analises')
        .where({ id: existing.id })
        .update({
          configuracao: JSON.stringify(config),
          id_usuario: req.userId,
          updated_at: db.fn.now()
        });
      res.json({ id: existing.id, message: 'Análise atualizada' });
    } else {
      const [id] = await db('tb_analises').insert({
        id_usuario: req.userId,
        id_custodia: custodyId,
        data_referencia: referenceDate,
        configuracao: JSON.stringify(config)
      });
      res.status(201).json({ id, message: 'Análise salva' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao salvar análise' });
  }
});

// GET /api/analyses/detail
// Returns detailed ATM-level predictions based on saved analysis
router.get('/detail', async (req, res) => {
  const { custodyId, referenceDate } = req.query;
  if (!custodyId || !referenceDate) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    const data = await getDetailData(custodyId, referenceDate);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(err.message === 'Nenhuma análise salva encontrada para esta data' ? 404 : 500).json({ error: err.message || 'Falha ao gerar detalhamento' });
  }
});

// Helper: fetch per-ATM totals for a custody on a given date
async function getAtmTotalsForDate(custodyId, date) {
  const atms = await db('tb_atms').where({ id_custodia: custodyId });
  const results = [];

  for (const atm of atms) {
    const totals = await db('tb_transacoes')
      .where({ id_atm: atm.id, data: date })
      .select('tipo')
      .sum('valor as total')
      .groupBy('tipo');

    let withdrawal = 0;
    let deposit = 0;
    totals.forEach(t => {
      if (t.tipo === 'saque') withdrawal = parseFloat(t.total) || 0;
      if (t.tipo === 'deposito') deposit = parseFloat(t.total) || 0;
    });

    results.push({
      id: atm.id,
      number: atm.numero,
      name: `ATM ${atm.numero}`,
      withdrawal,
      deposit
    });
  }

  return results;
}

// POST /api/analyses/export/pdf
// Exports consolidation to PDF — receives data from the frontend
router.post('/export/pdf', async (req, res) => {
  const { custodyId, date, factor } = req.body;
  if (!custodyId || !date) {
    return res.status(400).json({ error: 'Parâmetros ausentes (custodyId, date)' });
  }

  try {
    const custody = await db('tb_custodias').where({ id: custodyId }).first();
    const atms = await getAtmTotalsForDate(custodyId, date);
    const f = parseFloat(factor) || 1;

    const formatBRL = (val) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=consolidacao_${custodyId}_${date}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text('Consolidacao de Predicao', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(`Custodia: ${custody ? custody.nome : custodyId}`, { align: 'center' });
    doc.text(`Data: ${date}  |  Fator de Ajuste: x${f.toFixed(2)}`, { align: 'center' });
    doc.moveDown(1.5);

    // Totals
    const totalW = atms.reduce((a, b) => a + b.withdrawal, 0);
    const totalD = atms.reduce((a, b) => a + b.deposit, 0);
    doc.fontSize(12).font('Helvetica-Bold').text(`Total Sacado: R$ ${formatBRL(totalW * f)}`);
    doc.text(`Total Depositado: R$ ${formatBRL(totalD * f)}`);
    doc.moveDown(1.5);

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    const startX = 50;
    doc.text('ATM', startX, doc.y, { width: 120, continued: false });
    const headerY = doc.y - 12;
    doc.text('Sacado (R$)', startX + 130, headerY, { width: 120, align: 'right' });
    doc.text('Depositado (R$)', startX + 260, headerY, { width: 120, align: 'right' });
    doc.text('Sacado Ajust.', startX + 380, headerY, { width: 100, align: 'right' });
    doc.moveDown(0.3);
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font('Helvetica').fontSize(9);
    atms.forEach(atm => {
      const y = doc.y;
      doc.text(atm.name, startX, y, { width: 120 });
      doc.text(`R$ ${formatBRL(atm.withdrawal)}`, startX + 130, y, { width: 120, align: 'right' });
      doc.text(`R$ ${formatBRL(atm.deposit)}`, startX + 260, y, { width: 120, align: 'right' });
      doc.text(`R$ ${formatBRL(atm.withdrawal * f)}`, startX + 380, y, { width: 100, align: 'right' });
      doc.moveDown(0.2);
    });

    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Falha ao gerar PDF' });
    }
  }
});

// POST /api/analyses/export/excel
// Exports consolidation to Excel
router.post('/export/excel', async (req, res) => {
  const { custodyId, date, factor } = req.body;
  if (!custodyId || !date) {
    return res.status(400).json({ error: 'Parâmetros ausentes (custodyId, date)' });
  }

  try {
    const custody = await db('tb_custodias').where({ id: custodyId }).first();
    const atms = await getAtmTotalsForDate(custodyId, date);
    const f = parseFloat(factor) || 1;

    const sheetData = atms.map(atm => ({
      'ATM': atm.name,
      'Identificacao': atm.number,
      'Sacado (R$)': atm.withdrawal,
      'Depositado (R$)': atm.deposit,
      'Fator': f,
      'Sacado Ajustado (R$)': +(atm.withdrawal * f).toFixed(2),
      'Depositado Ajustado (R$)': +(atm.deposit * f).toFixed(2)
    }));

    // Totals row
    const totalW = atms.reduce((a, b) => a + b.withdrawal, 0);
    const totalD = atms.reduce((a, b) => a + b.deposit, 0);
    sheetData.push({
      'ATM': 'TOTAL',
      'Identificacao': '',
      'Sacado (R$)': totalW,
      'Depositado (R$)': totalD,
      'Fator': f,
      'Sacado Ajustado (R$)': +(totalW * f).toFixed(2),
      'Depositado Ajustado (R$)': +(totalD * f).toFixed(2)
    });

    const worksheet = xlsx.utils.json_to_sheet(sheetData);
    
    // Column widths
    worksheet['!cols'] = [
      { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 22 }, { wch: 24 }
    ];

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${custody ? custody.nome : 'Dados'}`);

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="consolidacao_${custodyId}_${date}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    console.error('Erro ao gerar Excel:', err);
    res.status(500).json({ error: 'Falha ao gerar Excel' });
  }
});

module.exports = router;
