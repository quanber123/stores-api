import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  createProduct,
  dashboard_getAllProducts,
  dashboard_getProductById,
  deleteProduct,
  getReviews,
  publishedProduct,
  updateProduct,
} from '../../controllers/dashboard/product.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/products')
  .get(auth, dashboard_getAllProducts)
  .post(auth, uploadImg.array('images'), createProduct);
router
  .route(`/api/dashboard/products/:id`)
  .get(auth, dashboard_getProductById)
  .put(auth, uploadImg.array('images'), updateProduct)
  .delete(auth, deleteProduct);

router
  .route('/api/dashboard/products_toggle_published/:id')
  .put(auth, publishedProduct);
router.route('/api/dashboard/products/reviews/:id').get(getReviews);
export const router_product_dashboard = router;
