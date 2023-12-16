import {
  getUserByToken,
  sendCodeVerifiedAccount,
  userLogin,
  userRegister,
  verifiedAccount,
} from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.js';
import { Router, json } from 'express';
const routerUser = Router();
routerUser.use(json());
routerUser.route('/api/auth/verify-email').post(verifiedAccount);
routerUser.route('/api/auth/send-code-email').post(sendCodeVerifiedAccount);
routerUser.route('/api/auth/register').post(userRegister);
routerUser.route('/api/auth/login').post(userLogin);
routerUser.route('/api/auth/get-user').get(auth, getUserByToken);
export default routerUser;
