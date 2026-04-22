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

      const userPassword = user.senha || user.password;
      
      if (!userPassword) {
        return res.status(500).json({ error: 'Erro interno: credencial não encontrada' });
      }

      if (!(await bcrypt.compare(password, userPassword))) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      user.senha = undefined;
      user.password = undefined;

      const isAdmin = user.perfil === 'administrador' || user.perfil === 'admin' || user.role === 'admin';

      res.json({
        user: {
          id: user.id,
          name: user.nome || user.name,
          email: user.email,
          role: isAdmin ? 'admin' : 'analyst',
          created_at: user.created_at
        },
        token: generateToken({ id: user.id, role: isAdmin ? 'admin' : 'analyst' }),
      });
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(500).json({ error: 'Falha na autenticação' });
    }
  }
};
