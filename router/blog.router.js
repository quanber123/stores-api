import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { uploadImg } from '../middleware/uploadImg.js';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  postComment,
} from '../controllers/blog.controllers.js';
const routerBlog = Router();
routerBlog.use(json());
routerBlog.route('/api/blogs').get(getAllBlogs).post(createBlog);
routerBlog.route(`/api/blogs/:id`).get(getBlogById);
routerBlog.route(`/api/blogs/:id/comments`).post(postComment);
export default routerBlog;
