import { Router, json } from 'express';
import { uploadImg } from '../../middleware/uploadImg.js';
import { auth } from '../../middleware/auth.js';
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../../controllers/dashboard/coupons.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/coupons')
  .get(auth, getAllCoupons)
  .post(auth, uploadImg.single('image'), createCoupon);
router.route('/api/coupons/:id').delete(auth, deleteCoupon);
export const router_coupon_dashboard = router;
