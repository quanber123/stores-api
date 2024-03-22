import { Router, json } from 'express';
import {
  getAllOrders,
  getBestSellingProducts,
  getTotalAmount,
  getTotalFigures,
  getWeeklyFigures,
} from '../../controllers/order/figures.controllers.js';
import { auth } from '../../middleware/auth.js';
const routerFigures = Router();
routerFigures.use(json());
routerFigures.route('/api/figures_count').get(auth, getTotalFigures);
routerFigures.route('/api/figures_amount').get(auth, getTotalAmount);
routerFigures.route('/api/weekly_figures').get(auth, getWeeklyFigures);
routerFigures.route('/api/best_selling').get(auth, getBestSellingProducts);
routerFigures.route('/api/orders').get(auth, getAllOrders);
export default routerFigures;
