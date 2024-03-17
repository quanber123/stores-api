import { Router, json } from 'express';
import {
  checkAndUpdateCoupon,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  publishedCoupon,
  updateCoupon,
} from '../../controllers/product/coupons.controllers.js';
import { uploadImg } from '../../middleware/uploadImg.js';
const routerCoupon = Router();
routerCoupon.use(json());
routerCoupon
  .route('/api/coupons')
  .get(getAllCoupons)
  .post(uploadImg, createCoupon);
routerCoupon.route('/api/coupons/:id').put(updateCoupon).delete(deleteCoupon);
routerCoupon.route('/api/coupons_toggle_published/:id').put(publishedCoupon);
routerCoupon.route('/api/check_coupon').get(checkAndUpdateCoupon);
export default routerCoupon;
