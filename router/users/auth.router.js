import { Router, json } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { createContact } from '../../controllers/users/contact.controllers.js';
import { deleteCache } from '../../modules/cache.js';
import { randomToken } from '../../utils/generateVerificationCode.js';
import { redisClient } from '../../config/redis.js';
const router = Router();
const client_url = process.env.CLIENT_URL;
router.use(json());
router.post('/api/contact', createContact);
router.get(`/api/auth/login/failed`, (req, res) => {
  res.status(401).json({ success: false, message: 'failure' });
});
router.post(`/api/auth/logout`, async (req, res) => {
  const token = req.headers['authorization'];
  const getToken = token?.split(' ')[1];
  const deletedToken = await redisClient.del(`accessToken:${getToken}`);
  if (deletedToken === 1)
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Logout user successfully!',
    });
  return res.status(409).json({
    error: true,
    success: false,
    message: 'User already logout!',
  });
  // req.logout(function (err) {
  //   if (err) {
  //     return next(err);
  //   }
  // });
  // res.redirect(client_url);
});
router.get(
  `/api/auth/google`,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
router.get(
  `/api/auth/google/callback`,
  passport.authenticate('google', {
    session: false,
  }),
  async (req, res) => {
    const { user } = req;
    // const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
    //   expiresIn: `90d`,
    // });
    const token = await randomToken();
    await redisClient.setEx(
      `accessToken:${token}`,
      Number(process.env.DEFAULT_EXPIRATION),
      JSON.stringify(user)
    );
    return res.redirect(`${client_url}?token=${token}`);
  }
);
router.get(
  `/api/auth/facebook`,
  passport.authenticate('facebook', {
    scope: ['email'],
  })
);
router.get(
  `/api/auth/facebook/callback`,
  passport.authenticate('facebook', {
    session: false,
  }),
  async (req, res) => {
    const { user } = req;
    // const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
    //   expiresIn: `90d`,
    // });
    const token = await randomToken();
    await redisClient.setEx(
      `accessToken:${token}`,
      Number(process.env.DEFAULT_EXPIRATION),
      JSON.stringify(user)
    );
    return res.redirect(`${client_url}?token=${token}`);
  }
);
export const router_auth = router;
