import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createStatusOrder,
  deleteStatusOrder,
  getAllStatusOrder,
} from '../../controllers/dashboard/status.order.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/status-order')
  .get(auth, getAllStatusOrder)
  .post(auth, createStatusOrder);
router.route('/api/dashboard/status-order/:id').delete(auth, deleteStatusOrder);
export const router_status_order_dashboard = router;
