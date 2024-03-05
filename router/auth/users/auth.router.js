import { Router, json } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
const routerAuth = Router();
const client_url = process.env.CLIENT_URL;
routerAuth.use(json());
routerAuth.get(`/api/auth/login/failed`, (req, res) => {
  res.status(401).json({ success: false, message: 'failure' });
});
routerAuth.get(`/api/auth/logout`, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect(client_url);
});
routerAuth.get(
  `/api/auth/google`,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
routerAuth.get(
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
routerAuth.get(
  `/api/auth/facebook`,
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
);
routerAuth.get(
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
export default routerAuth;
