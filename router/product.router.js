import { Router, json } from 'express';
import {
  getAllProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/product.controllers.js';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import { uploadImg } from '../middleware/uploadImg.js';
config();
const routerProduct = Router();
const end_point = process.env.END_POINT_PRODUCT;
routerProduct.use(json());
routerProduct
  .route(end_point)
  .get(getAllProducts)
  .get(searchProducts)
  .post(uploadImg, createProduct)
  .put(updateProduct)
  .delete(deleteProduct);
routerProduct.route(`${end_point}/:id`).get(getProductById);
export default routerProduct;
