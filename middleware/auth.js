// import jwt from 'jsonwebtoken';
import { redisClient } from '../config/redis.js';
export const auth = async (req, res, next) => {
  const token = req.headers['authorization'];
  const getToken = token?.split(' ')[1];
  if (!getToken) {
    return res.status(401).json({ error: 'Token not exist' });
  }
  // using redis
  const data = await redisClient.get(`accessToken:${getToken}`);
  if (!data)
    return res.status(403).json({ message: 'Token is not incorrect!' });

  req.decoded = JSON.parse(data);
  next();
  // using json web token
  // jwt.verify(getToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
  //   if (err) {
  //     return res.status(403).json({ message: 'Token is not incorrect!' });
  //   }
  //   if (decoded) {
  //     req.decoded = decoded;
  //     next();
  //   }
  // });
};
