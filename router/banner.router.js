import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from '../controllers/banner.controllers.js';
const routerBanner = Router();
routerBanner.use(json());
routerBanner
  .route('/api/banners')
  .get(getAllBanners)
  .post(createBanner)
  .put(updateBanner)
  .delete(deleteBanner);

export default routerBanner;
