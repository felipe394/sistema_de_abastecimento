const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Nenhum token fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    return next();
  });
};

module.exports = authMiddleware;
