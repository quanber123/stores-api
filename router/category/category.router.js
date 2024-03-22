import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/label/category/category.controllers.js';
import { uploadImg } from '../../middleware/uploadImg.js';
const routerCategory = Router();
routerCategory.use(json());
routerCategory
  .route('/api/categories')
  .get(getAllCategories)
  .post(auth, uploadImg.single('image'), createCategory);
routerCategory
  .route('/api/categories/:id')
  .put(auth, uploadImg.single('image'), updateCategory)
  .delete(auth, deleteCategory);

export default routerCategory;
