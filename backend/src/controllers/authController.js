const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (params = {}) => {
  return jwt.sign(params, process.env.JWT_SECRET || 'secret123', {
    expiresIn: 86400,
  });
};

module.exports = {
  async authenticate(req, res) {
    const { email, password } = req.body;

    try {
      const user = await db('tb_usuarios').where({ email }).first();

      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      user.password = undefined;

      res.json({
        user,
        token: generateToken({ id: user.id, role: user.role }),
      });
    } catch (err) {
      return res.status(500).json({ error: 'Falha na autenticação' });
    }
  }
};
