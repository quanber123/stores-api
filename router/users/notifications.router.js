import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  deleteNotifications,
  getNotifications,
  updateNotifications,
} from '../../controllers/users/notifications.controllers.js';

const router = Router();
router.use(json());
router.route('/api/notifications').get(auth, getNotifications);
router
  .route('/api/notifications/:id')
  .put(auth, updateNotifications)
  .delete(auth, deleteNotifications);
export const router_notifications = router;
