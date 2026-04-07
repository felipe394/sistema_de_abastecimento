const express = require('express');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
router.use(authMiddleware);

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
    const atms = await db('tb_atms').where({ custody_id: custodyId });
    
    // Return mock calculated index and individual ATM adjustments
    const simulationIndex = 1.02; // e.g. 2% more
    const results = atms.map(atm => ({
      atmId: atm.id,
      atmNumber: atm.number,
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
      .where({ custody_id: custodyId, reference_date: referenceDate })
      .first();
    
    if (analysis && analysis.config) {
      return res.json(typeof analysis.config === 'string' ? JSON.parse(analysis.config) : analysis.config);
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
      .where({ custody_id: custodyId, reference_date: referenceDate })
      .first();

    if (existing) {
      await db('tb_analises')
        .where({ id: existing.id })
        .update({
          config: JSON.stringify(config),
          user_id: req.userId,
          updated_at: db.fn.now()
        });
      res.json({ id: existing.id, message: 'Análise atualizada' });
    } else {
      const [id] = await db('tb_analises').insert({
        user_id: req.userId,
        custody_id: custodyId,
        reference_date: referenceDate,
        config: JSON.stringify(config)
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
    const analysis = await db('tb_analises')
      .where({ custody_id: custodyId, reference_date: referenceDate })
      .first();

    if (!analysis) {
      return res.status(404).json({ error: 'Nenhuma análise salva encontrada para esta data' });
    }

    const config = typeof analysis.config === 'string' ? JSON.parse(analysis.config) : analysis.config;
    const { lines, dateRows, actionFinalMacro, actionFinalMicro } = config;

    // Fetch all ATMs for this custody
    const atms = await db('tb_atms').where({ custody_id: custodyId });
    
    // Fetch historical data for the dates mentioned in config
    const allDates = Object.values(dateRows).flat().map(d => d.date).filter(Boolean);
    const uniqueDates = [...new Set(allDates)];
    
    const transactions = await db('tb_transacoes')
      .where({ custody_id: custodyId })
      .whereIn('date', uniqueDates);

    // Helper to get total for an ATM on a set of dates with their factors
    const getAtmPrediction = (atmId, type) => {
      // Calculate row-level values for this specific ATM
      const rowValues = lines
        .filter(row => row.macro) // We'll use Macro for detail view by default or similar
        .map(row => {
          const rowDates = dateRows[row.id] || [];
          const dailyValues = rowDates.map(rd => {
            const trans = transactions.find(t => t.atm_id === atmId && t.date.toISOString().split('T')[0] === rd.date);
            const baseAmount = trans ? (type === 'W' ? trans.withdrawal : trans.deposit) : 0;
            const factorString = type === 'W' ? rd.factorW : rd.factorD;
            const factor = parseFloat(factorString.replace(',', '.')) || 1;
            return baseAmount * factor;
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
      id: atm.number,
      name: `ATM ${atm.number}`,
      withdrawal: getAtmPrediction(atm.id, 'W'),
      deposit: getAtmPrediction(atm.id, 'D'),
    }));

    res.json({
      custody: await db('tb_custodias').where({ id: custodyId }).first(),
      referenceDate,
      atms: results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Falha ao gerar detalhamento' });
  }
});

module.exports = router;
