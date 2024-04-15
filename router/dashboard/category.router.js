import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/dashboard/category.controllers.js';
import { uploadImg } from '../../middleware/uploadImg.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/categories')
  .get(auth, getAllCategories)
  .post(auth, uploadImg.single('image'), createCategory);
router
  .route('/api/dashboard/categories/:id')
  .put(auth, uploadImg.single('image'), updateCategory)
  .delete(auth, deleteCategory);

export const router_category_dashboard = router;
