import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controllers.js';
config();
const routerCategory = Router();
const end_point = process.env.END_POINT_CATEGORY;
routerCategory.use(json());
routerCategory
  .route(end_point)
  .get(getAllCategories)
  .post(createCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default routerCategory;
