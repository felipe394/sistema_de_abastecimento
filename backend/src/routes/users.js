const express = require('express');
const db = require('../database');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

// Middleware to ensure user is admin
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/users
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await db('users').select('id', 'name', 'email', 'role', 'created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// POST /api/users
router.post('/', adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [id] = await db('users').insert({
      name,
      email,
      password: hashedPassword,
      role: role || 'analyst'
    });
    
    res.status(201).json({ id, name, email, role });
  } catch (err) {
    res.status(400).json({ error: 'Error creating user' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db('users').where({ id: req.params.id }).del();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;
