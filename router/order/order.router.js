import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCashPayment,
  createTransferLink,
  getAllOrdersByUsersId,
  getAllOrdersUser,
  getOrderByCode,
  getOrdersUserById,
  updateOrder,
} from '../../controllers/order/order.controllers.js';
const routerOrder = Router();
routerOrder.use(json());
routerOrder
  .route('/api/create-payment-transfer')
  .post(auth, createTransferLink);
routerOrder.route('/api/create-payment-cash').post(auth, createCashPayment);
routerOrder.route('/api/user_orders').get(auth, getAllOrdersUser);
routerOrder.route('/api/user_orders/:orderId').get(auth, getOrdersUserById);
routerOrder.route('/api/user_orders/:orderId').put(updateOrder);
routerOrder.route('/api/orders/users/:id').get(getAllOrdersByUsersId);
routerOrder.route('/api/orders/:code').get(getOrderByCode);
export default routerOrder;
