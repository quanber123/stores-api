import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import { uploadImg } from '../middleware/upload.js';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  postComment,
} from '../controllers/blog.controllers.js';
config();
const routerBlog = Router();
const end_point = process.env.END_POINT_BLOG;
routerBlog.use(json());
routerBlog.route(end_point).get(getAllBlogs).post(createBlog);
routerBlog.route(`${end_point}/:id`).get(getBlogById);
routerBlog.route(`${end_point}/:id/comments`).post(postComment);
export default routerBlog;
