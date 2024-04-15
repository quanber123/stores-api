import { Router, json } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { createContact } from '../../controllers/users/contact.controllers.js';
const router = Router();
const client_url = process.env.CLIENT_URL;
router.use(json());
router.post('/api/contact', createContact);
router.get(`/api/auth/login/failed`, (req, res) => {
  res.status(401).json({ success: false, message: 'failure' });
});
router.get(`/api/auth/logout`, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect(client_url);
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
  (req, res) => {
    const { user } = req;
    const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: `90d`,
    });
    res.redirect(`${client_url}?token=${token}`);
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
  (req, res) => {
    const { user } = req;
    const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: `90d`,
    });
    res.redirect(`${client_url}?token=${token}`);
  }
);
export const router_auth = router;
