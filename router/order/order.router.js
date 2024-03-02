import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCashPayment,
  createTransferLink,
  getAllOrders,
  getOrderById,
  updateOrder,
} from '../../controllers/order/order.controllers.js';
const routerOrder = Router();
routerOrder.use(json());
routerOrder
  .route('/api/create-payment-transfer')
  .post(auth, createTransferLink);
routerOrder.route('/api/create-payment-cash').post(auth, createCashPayment);
routerOrder.route('/api/orders').get(auth, getAllOrders);
routerOrder.route('/api/orders/:orderId').get(auth, getOrderById);
routerOrder.route('/api/orders/:orderId').put(auth, updateOrder);
export default routerOrder;
