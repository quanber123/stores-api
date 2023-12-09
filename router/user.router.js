import { getUserByToken } from '../controllers/user.controllers.js';
import { auth } from '../middleware/auth.js';
import { Router, json } from 'express';
const routerUser = Router();
routerUser.use(json());
routerUser.route('/api/auth/get-user').get(auth, getUserByToken);
export default routerUser;
