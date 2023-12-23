import { Router, json } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
const routerAuth = Router();
const end_point = process.env.END_POINT_AUTH;
const client_url = process.env.CLIENT_URL;
routerAuth.use(json());
routerAuth.get(`${end_point}/login/failed`, (req, res) => {
  res.status(401).json({ success: false, message: 'failure' });
});
routerAuth.get(`${end_point}/login/success`, (req, res) => {
  if (req.user) {
    const token = jwt.sign(
      { user: req.user },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: `90d` }
    );
    return res.status(200).json({
      success: true,
      message: 'successful',
      user: req.user,
      accessToken: token,
    });
  }
  return res.status(404).json({ message: 'Not Found!' });
});
routerAuth.get(`${end_point}/logout`, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect(client_url);
});
routerAuth.get(
  `${end_point}/google`,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
routerAuth.get(
  `${end_point}/google/callback`,
  passport.authenticate('google', {
    successRedirect: client_url,
    failureRedirect: '/login/failed',
    session: true,
    expiresIn: '60m',
  })
);
routerAuth.get(
  `${end_point}/facebook`,
  passport.authenticate('facebook', { scope: ['profile', 'email'] })
);
routerAuth.get(
  `${end_point}/facebook/callback`,
  passport.authenticate('facebook', {
    successRedirect: client_url,
    failureRedirect: '/login/failed',
    session: true,
    expiresIn: '60m',
  })
);

export default routerAuth;
