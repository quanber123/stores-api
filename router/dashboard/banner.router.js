import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from '../../controllers/dashboard/banners.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/banners')
  .get(auth, getAllBanners)
  .post(auth, uploadImg.single('image'), createBanner);
router
  .route('/api/dashboard/banners/:id')
  .put(auth, uploadImg.single('image'), updateBanner)
  .delete(auth, deleteBanner);

export const router_banner_dashboard = router;
