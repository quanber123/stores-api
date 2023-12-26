import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from 'dotenv';
import {
  createNotify,
  deleteNotify,
  getAllNotifications,
  updateNotify,
} from '../controllers/notify.controllers.js';
config();
const routerNotify = Router();
const end_point = process.env.END_POINT_NOTIFY;
routerNotify.use(json());
routerNotify
  .route(end_point)
  .get(getAllNotifications)
  .post(createNotify)
  .put(updateNotify)
  .delete(deleteNotify);

export default routerNotify;
