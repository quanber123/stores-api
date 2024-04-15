import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createBlog,
  getAllBlogs,
  getAllComments,
  getBlogById,
} from '../../controllers/dashboard/blog.controllers.js';
const router = Router();
router.use(json());
router.route('/api/dashboard/blogs').get(getAllBlogs).post(auth, createBlog);
router.route(`/api/dashboard/blogs/:id`).get(getBlogById);
router.route(`/api/dashboard/blogs/:id/comments`).get(auth, getAllComments);
export const router_blog_dashboard = router;
