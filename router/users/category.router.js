import { Router, json } from 'express';
import { getAllCategories } from '../../controllers/users/category.controllers.js';
const router = Router();
router.use(json());
router.route('/api/categories').get(getAllCategories);
export const router_category = router;
