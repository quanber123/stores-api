import {
  getUserByToken,
  googleLogin,
} from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.js';
import { Router, json } from 'express';
const router = Router();
router.use(json());
router.route('/api/auth/get-user').get(auth, getUserByToken);
router.route('/api/auth/login-google').post(googleLogin);
export const routerUser = router;
