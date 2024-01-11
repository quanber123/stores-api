import {
  getAllSettings,
  getUserByToken,
  sendCodeVerifiedAccount,
  toggleNotifications,
  updateAvatar,
  updateProfile,
  userLogin,
  userRegister,
  verifiedAccount,
} from '../../controllers/user/user.controllers.js';
import { auth } from '../../middleware/auth.js';
import { Router, json } from 'express';
import { uploadImg } from '../../middleware/uploadImg.js';
const routerUser = Router();
routerUser.use(json());
routerUser.route('/api/auth/verify-email').post(verifiedAccount);
routerUser.route('/api/auth/send-code-email').post(sendCodeVerifiedAccount);
routerUser.route('/api/auth/register').post(userRegister);
routerUser.route('/api/auth/login').post(userLogin);
routerUser.route('/api/auth/get-user').get(auth, getUserByToken);
routerUser.route('/api/users/profile').put(auth, updateProfile);
routerUser.route('/api/users/avatar').put(auth, uploadImg, updateAvatar);
routerUser.route('/api/settings/:id').get(auth, getAllSettings);
routerUser.route('/api/settings').put(auth, toggleNotifications);
export default routerUser;
