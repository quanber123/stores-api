import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createSale,
  deleteSale,
  getAllSales,
} from '../../controllers/product/sale.controllers.js';
const routerSale = Router();
routerSale.use(json());
routerSale.route('/api/sales').get(getAllSales).post(createSale);
routerSale.route('/api/sales/:id').delete(deleteSale);

export default routerSale;
