import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/label/category/category.controllers.js';
const routerCategory = Router();
routerCategory.use(json());
routerCategory
  .route('/api/categories')
  .get(getAllCategories)
  .post(createCategory);
routerCategory
  .route('/api/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

export default routerCategory;
