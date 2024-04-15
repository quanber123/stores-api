import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllOrdersByUserId,
  getOrderByCode,
  updateOrder,
} from '../../controllers/dashboard/order.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/user_orders/:orderId')
  .get(auth, getAllOrdersByUserId);
router.route('/api/dashboard/user_orders/:orderId').put(auth, updateOrder);
router.route('/api/dashboard/orders/:code').get(auth, getOrderByCode);
export const router_order_dashboard = router;
