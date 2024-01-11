import { Router, json } from 'express';
import {
  getAllProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../../controllers/product/product.controllers.js';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
const routerProduct = Router();
routerProduct.use(json());
routerProduct
  .route('/api/products')
  .get(getAllProducts)
  .get(searchProducts)
  .post(uploadImg, createProduct);
routerProduct
  .route(`/api/products/:id`)
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);
export default routerProduct;
