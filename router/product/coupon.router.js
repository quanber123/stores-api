import { Router, json } from 'express';
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../../controllers/product/coupons.controllers.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import { auth } from '../../middleware/auth.js';
const routerCoupon = Router();
routerCoupon.use(json());
routerCoupon
  .route('/api/coupons')
  .get(getAllCoupons)
  .post(auth, uploadImg.single('image'), createCoupon);
routerCoupon.route('/api/coupons/:id').delete(auth, deleteCoupon);
export default routerCoupon;
