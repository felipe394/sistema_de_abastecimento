const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let authHeader = req.headers.authorization;
  let token;

  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Erro no token' });
    
    const [scheme, parsedToken] = parts;
    if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Token malformatado' });
    
    token = parsedToken;
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Nenhum token fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    return next();
  });
};

module.exports = authMiddleware;
