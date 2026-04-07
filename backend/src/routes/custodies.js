const express = require('express');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/custodies
router.get('/', async (req, res) => {
  try {
    const custodies = await db('custodies').select('*');
    res.json(custodies);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching custodies' });
  }
});

// POST /api/custodies (Admin only)
router.post('/', async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const [id] = await db('custodies').insert({ name });
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(400).json({ error: 'Error creating custody (might already exist)' });
  }
});

module.exports = router;
