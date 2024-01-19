import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCashPayment,
  createTransferLink,
  getAllOrders,
  getOrderById,
  updateOrder,
} from '../../controllers/product/payment.controllers.js';
const routerPayment = Router();
routerPayment.use(json());
routerPayment
  .route('/api/create-payment-transfer')
  .post(auth, createTransferLink);
routerPayment.route('/api/create-payment-cash').post(auth, createCashPayment);
routerPayment.route('/api/orders').get(auth, getAllOrders);
routerPayment.route('/api/orders/:orderId').get(auth, getOrderById);
routerPayment.route('/api/orders/:orderId').put(auth, updateOrder);
export default routerPayment;
