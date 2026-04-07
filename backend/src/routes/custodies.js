const express = require('express');
const db = require('../database');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

// GET /api/custodies
router.get('/', async (req, res) => {
  try {
    const custodies = await db('tb_custodias').select('*');
    res.json(custodies);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar custódias' });
  }
});

// POST /api/custodies (Admin only)
router.post('/', async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }

  const { name, region, cities, description, status } = req.body;
  if (!name) return res.status(400).json({ error: 'O nome é obrigatório' });

  try {
    const [id] = await db('tb_custodias').insert({ name, region, cities, description, status });
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar custódia (pode já existir)' });
  }
});

// PUT /api/custodies/:id (Admin only)
router.put('/:id', async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }

  const { id } = req.params;
  const { name, region, cities, description, status } = req.body;

  try {
    await db('tb_custodias').where({ id }).update({ name, region, cities, description, status });
    res.json({ message: 'Custódia atualizada com sucesso' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar custódia' });
  }
});

// DELETE /api/custodies/:id (Admin only)
router.delete('/:id', async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }

  const { id } = req.params;

  try {
    await db('tb_custodias').where({ id }).del();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir custódia' });
  }
});

// GET /api/custodies/:id/daily-totals?date=YYYY-MM-DD
router.get('/:id/daily-totals', async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: 'A data é obrigatória' });

  try {
    const totals = await db('tb_transacoes')
      .join('tb_atms', 'tb_transacoes.atm_id', 'tb_atms.id')
      .where('tb_atms.custody_id', id)
      .where('tb_transacoes.date', date)
      .select('tb_transacoes.type')
      .sum('amount as total')
      .groupBy('tb_transacoes.type');

    const result = {
      withdrawal: 0,
      deposit: 0
    };

    totals.forEach(t => {
      if (t.type === 'withdrawal') result.withdrawal = parseFloat(t.total);
      if (t.type === 'deposit') result.deposit = parseFloat(t.total);
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar totais diários' });
  }
});

module.exports = router;
