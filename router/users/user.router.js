import {
  getUserByToken,
  sendCodeVerifiedAccount,
  updateAvatar,
  updateProfile,
  userLogin,
  userRegister,
  verifiedAccount,
} from '../../controllers/users/user.controllers.js';
import { auth } from '../../middleware/auth.js';
import { Router, json } from 'express';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  createAddress,
  deleteAddress,
  getAllAddress,
  updateAddress,
} from '../../controllers/users/address.controllers.js';
import {
  getAllFavorites,
  postFavorites,
} from '../../controllers/users/favorite.controllers.js';
const router = Router();
router.use(json());
router.route('/api/auth/verify-email').post(auth, verifiedAccount);
router.route('/api/auth/send-code-email').post(auth, sendCodeVerifiedAccount);
router.route('/api/auth/register').post(userRegister);
router.route('/api/auth/login').post(userLogin);
router.route('/api/auth/get-user').get(auth, getUserByToken);
router.route('/api/users/profile').put(auth, updateProfile);
router
  .route('/api/users/:id/avatar')
  .put(auth, uploadImg.single('image'), updateAvatar);
router
  .route('/api/users/favorites')
  .get(auth, getAllFavorites)
  .post(auth, postFavorites);
router
  .route('/api/users/address')
  .get(auth, getAllAddress)
  .post(auth, createAddress);
router
  .route('/api/users/address/:id')
  .put(auth, updateAddress)
  .delete(auth, deleteAddress);
export const router_user = router;
