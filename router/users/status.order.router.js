import { Router, json } from 'express';
import { getAllStatusOrder } from '../../controllers/users/status.order.controllers.js';
const router = Router();
router.use(json());
router.route('/api/status-order').get(getAllStatusOrder);
export const router_status_order = router;
