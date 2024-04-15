import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllCustomers,
  getAllOrders,
  getBestSellingProducts,
  getTotalAmount,
  getTotalFigures,
  getWeeklyFigures,
} from '../../controllers/dashboard/figures.controllers.js';
const router = Router();
router.use(json());
router.route('/api/dashboard/users/getAll').get(auth, getAllCustomers);
router.route('/api/figures_count').get(auth, getTotalFigures);
router.route('/api/figures_amount').get(auth, getTotalAmount);
router.route('/api/weekly_figures').get(auth, getWeeklyFigures);
router.route('/api/best_selling').get(auth, getBestSellingProducts);
router.route('/api/orders').get(auth, getAllOrders);
export const routerFigures_dashboard = router;
