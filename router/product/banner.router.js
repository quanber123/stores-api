import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from '../../controllers/product/banner.controllers.js';
import { uploadImg } from '../../middleware/uploadImg.js';
const routerBanner = Router();
routerBanner.use(json());
routerBanner
  .route('/api/banners')
  .get(getAllBanners)
  .post(auth, uploadImg.single('image'), createBanner);
routerBanner
  .route('/api/banners/:id')
  .put(auth, uploadImg.single('image'), updateBanner)
  .delete(auth, deleteBanner);

export default routerBanner;
