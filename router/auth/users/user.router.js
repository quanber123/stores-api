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
} from '../../../controllers/auth/users/user.controllers.js';
import { auth } from '../../../middleware/auth.js';
import { Router, json } from 'express';
import { uploadImg } from '../../../middleware/uploadImg.js';
import {
  createAddress,
  deleteAddress,
  getAllAddress,
  updateAddress,
} from '../../../controllers/auth/users/address.controllers.js';
import {
  getAllFavorites,
  postFavorites,
} from '../../../controllers/product/favorite.controllers.js';
import { getAllCustomers } from '../../../controllers/order/figures.controllers.js';
const routerUser = Router();
routerUser.use(json());
routerUser.route('/api/users/getAll').get(getAllCustomers);
routerUser.route('/api/auth/verify-email').post(verifiedAccount);
routerUser.route('/api/auth/send-code-email').post(sendCodeVerifiedAccount);
routerUser.route('/api/auth/register').post(userRegister);
routerUser.route('/api/auth/login').post(userLogin);
routerUser.route('/api/auth/get-user').get(auth, getUserByToken);
routerUser.route('/api/users/profile').put(auth, updateProfile);
routerUser.route('/api/users/:id/avatar').put(auth, uploadImg, updateAvatar);
routerUser.route('/api/settings/:id').get(auth, getAllSettings);
routerUser.route('/api/settings').put(auth, toggleNotifications);
routerUser
  .route('/api/users/favorites')
  .get(auth, getAllFavorites)
  .post(auth, postFavorites);
routerUser
  .route('/api/users/address')
  .get(auth, getAllAddress)
  .post(auth, createAddress);
routerUser
  .route('/api/users/address/:id')
  .put(auth, updateAddress)
  .delete(auth, deleteAddress);
export default routerUser;
