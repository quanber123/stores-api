import { Router, json } from 'express';
import {
  getAllProducts,
  getProductById,
  reviewsProduct,
  getReviews,
} from '../../controllers/users/product.controllers.js';
import { auth } from '../../middleware/auth.js';
import { getFavoritesByProduct } from '../../controllers/users/favorite.controllers.js';
const router = Router();
router.use(json());
router.route('/api/products').get(getAllProducts);
router.route(`/api/products/:id`).get(getProductById);
router.route('/api/products/favorite/:id').get(getFavoritesByProduct);
router.route('/api/products/reviews/:id').get(getReviews);
router.route('/api/products/reviews').post(auth, reviewsProduct);
export const router_product = router;
