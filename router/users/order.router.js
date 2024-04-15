import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCashPayment,
  createTransferLink,
  getAllOrdersUser,
  getOrderByCode,
  getOrdersUserById,
  updateOrder,
} from '../../controllers/users/order.controllers.js';

const router = Router();
router.use(json());
router.route('/api/create-payment-transfer').post(auth, createTransferLink);
router.route('/api/create-payment-cash').post(auth, createCashPayment);
router.route('/api/user_orders').get(auth, getAllOrdersUser);
router.route('/api/user_orders/:orderId').get(auth, getOrdersUserById);
router.route('/api/user_orders/:orderId').put(auth, updateOrder);
router.route('/api/orders/:code').get(auth, getOrderByCode);
export const router_order = router;
