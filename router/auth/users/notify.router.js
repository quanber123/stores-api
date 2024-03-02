import { Router, json } from 'express';
import { auth } from '../../../middleware/auth.js';
import {
  createNotify,
  deleteNotify,
  getAllNotifications,
  updateNotify,
} from '../../../controllers/auth/users/notify.controllers.js';
const routerNotify = Router();
routerNotify.use(json());
routerNotify
  .route('/api/notifications')
  .get(getAllNotifications)
  .post(createNotify)
  .put(updateNotify)
  .delete(deleteNotify);

export default routerNotify;
