import { Router, json } from 'express';
import {
  getTotalAmount,
  getTotalFigures,
} from '../../controllers/order/figures.controllers.js';
const routerFigures = Router();
routerFigures.use(json());
routerFigures.route('/api/figures_count').get(getTotalFigures);
routerFigures.route('/api/figures_amount').get(getTotalAmount);
export default routerFigures;
