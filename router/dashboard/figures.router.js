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
router.route('/api/dashboard/figures_count').get(auth, getTotalFigures);
router.route('/api/dashboard/figures_amount').get(auth, getTotalAmount);
router.route('/api/dashboard/weekly_figures').get(auth, getWeeklyFigures);
router.route('/api/dashboard/best_selling').get(auth, getBestSellingProducts);
router.route('/api/dashboard/orders').get(auth, getAllOrders);
export const routerFigures_dashboard = router;
