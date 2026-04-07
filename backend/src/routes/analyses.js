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
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Basic structured response for calculation (simplified logic for now)
    // In reality, this queries all `transactions` for the given custody and dates,
    // applies the line factors, groups by action (Maior, Media, etc), and calculates
    // the final % index diff between calculated macro and individual sums.
    
    // For scaffolding purposes, we simulate the calculation:
    const atms = await db('atms').where({ custody_id: custodyId });
    
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
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// POST /api/analyses
// Save an analysis
router.post('/', async (req, res) => {
  const { custodyId, referenceDate, config } = req.body;
  try {
    const [id] = await db('analyses').insert({
      user_id: req.userId,
      custody_id: custodyId,
      reference_date: referenceDate,
      config: JSON.stringify(config)
    });
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save analysis' });
  }
});

module.exports = router;
