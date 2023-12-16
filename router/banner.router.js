import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from '../controllers/banner.controllers.js';
config();
const routerBanner = Router();
const end_point = process.env.END_POINT_BANNER;
routerBanner.use(json());
routerBanner
  .route(end_point)
  .get(getAllBanners)
  .post(createBanner)
  .put(updateBanner)
  .delete(deleteBanner);

export default routerBanner;
