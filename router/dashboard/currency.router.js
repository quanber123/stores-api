import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  createCurrency,
  deleteCurrency,
  getAllCurrency,
  updateCurrency,
} from '../../controllers/dashboard/currency.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/currencies')
  .get(auth, getAllCurrency)
  .post(auth, uploadImg.single('image'), createCurrency);
router
  .route('/api/dashboard/currencies/:id')
  .put(auth, uploadImg.single('image'), updateCurrency)
  .delete(auth, deleteCurrency);
export const router_currency_dashboard = router;
