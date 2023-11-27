import jwt from 'jsonwebtoken';
export const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  const getToken = token.split(' ')[1];
  if (!getToken) {
    return res.status(401).json({ error: 'Token not exist' });
  }
  jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403);
    }
    if (decoded) {
      req.user = decoded;
      console.log(decoded);
      next();
    }
  });
};
