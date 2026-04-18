const express = require('express');
const db = require('../database');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

// Middleware to ensure user is admin
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  }
  next();
};

// GET /api/users
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await db('tb_usuarios').select('id', 'nome as name', 'email', 'perfil as role', 'created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// POST /api/users
router.post('/', adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [id] = await db('tb_usuarios').insert({
      nome: name,
      email,
      senha: hashedPassword,
      perfil: role || 'analista'
    });
    
    res.status(201).json({ id, name, email, role });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
});

// PUT /api/users/:id
router.put('/:id', adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;
  const updateData = { nome: name, email, perfil: role };
  
  try {
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.senha = await bcrypt.hash(password, salt);
    }
    
    await db('tb_usuarios').where({ id: req.params.id }).update(updateData);
    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db('tb_usuarios').where({ id: req.params.id }).del();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

module.exports = router;
