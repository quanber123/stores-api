import { Router, json } from 'express';
import {
  getAllProducts,
  searchProducts,
  filteredByField,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controllers.js';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
config();
const routerProduct = Router();
const end_point = process.env.END_POINT_PRODUCT;
routerProduct.use(json());
routerProduct
  .route(end_point)
  .get(getAllProducts)
  .get(searchProducts)
  .get(filteredByField)
  .post(createProduct)
  .put(updateProduct)
  .delete(deleteProduct);
export default routerProduct;
