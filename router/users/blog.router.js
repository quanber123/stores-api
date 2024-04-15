import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllBlogs,
  getAllComments,
  getBlogById,
  postComment,
} from '../../controllers/users/blog.controllers.js';
const router = Router();
router.use(json());
router.route('/api/blogs').get(getAllBlogs);
router.route(`/api/blogs/:id`).get(getBlogById);
router
  .route(`/api/blogs/:id/comments`)
  .get(getAllComments)
  .post(auth, postComment);
export const router_blog = router;
