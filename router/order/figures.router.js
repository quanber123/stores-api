import { Router, json } from 'express';
import {
  getBestSellingProducts,
  getTotalAmount,
  getTotalFigures,
  getWeeklyFigures,
} from '../../controllers/order/figures.controllers.js';
const routerFigures = Router();
routerFigures.use(json());
routerFigures.route('/api/figures_count').get(getTotalFigures);
routerFigures.route('/api/figures_amount').get(getTotalAmount);
routerFigures.route('/api/weekly_figures').get(getWeeklyFigures);
routerFigures.route('/api/best_selling').get(getBestSellingProducts);
export default routerFigures;
