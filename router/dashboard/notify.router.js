import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createNotify,
  deleteNotify,
  getAllNotifications,
  updateNotify,
} from '../../controllers/dashboard/notify.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/settings_notifications')
  .get(auth, getAllNotifications)
  .post(createNotify);
router
  .route('/api/dashboard/settings_notifications/:id')
  .put(auth, updateNotify)
  .delete(auth, deleteNotify);

export const router_notify_dashboard = router;
