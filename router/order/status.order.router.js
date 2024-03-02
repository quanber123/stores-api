import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createStatusOrder,
  deleteStatusOrder,
  getAllStatusOrder,
} from '../../controllers/order/status.order.controllers.js';
const routerStatusOrder = Router();
routerStatusOrder.use(json());
routerStatusOrder
  .route('/api/status-order')
  .get(getAllStatusOrder)
  .post(createStatusOrder);
routerStatusOrder.route('/api/status-order/:id').delete(deleteStatusOrder);
export default routerStatusOrder;
