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
  .post(uploadImg, createBanner);
routerBanner.route('/api/banners/:id').put(updateBanner).delete(deleteBanner);

export default routerBanner;
