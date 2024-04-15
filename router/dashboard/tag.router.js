import { Router, json } from 'express';
import {
  createTag,
  deleteTag,
  getAllTags,
  updateTag,
} from '../../controllers/dashboard/tag.controllers.js';
import { auth } from '../../middleware/auth.js';
const router = Router();
router.use(json());
router.route('/api/dashboard/tags').get(auth, getAllTags).post(auth, createTag);
router
  .route('/api/dashboard/tags/:id')
  .put(auth, updateTag)
  .post(auth, deleteTag);
export const router_tag_dashboard = router;
