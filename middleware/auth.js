import jwt from 'jsonwebtoken';
export const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Token not exist' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token incorrect!' });
    }
    if (decoded) {
      req.user = decoded;
      next();
    }
  });
};
