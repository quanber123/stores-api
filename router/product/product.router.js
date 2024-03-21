import { Router, json } from 'express';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  reviewsProduct,
  getReviews,
  publishedProduct,
} from '../../controllers/product/product.controllers.js';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import { getFavoritesByProduct } from '../../controllers/product/favorite.controllers.js';
const routerProduct = Router();
routerProduct.use(json());
routerProduct
  .route('/api/products')
  .get(getAllProducts)
  .post(uploadImg.array('images'), createProduct);
routerProduct
  .route(`/api/products/:id`)
  .get(getProductById)
  .put(uploadImg.array('images'), updateProduct)
  .delete(deleteProduct);
routerProduct.route('/api/products_toggle_published/:id').put(publishedProduct);
routerProduct.route('/api/products/favorite/:id').get(getFavoritesByProduct);
routerProduct.route('/api/products/reviews/:id').get(getReviews);
routerProduct.route('/api/products/reviews').post(auth, reviewsProduct);
export default routerProduct;
