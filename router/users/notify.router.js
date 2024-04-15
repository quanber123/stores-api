import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { getSettingsNotifications } from '../../controllers/users/notify.controllers.js';

const router = Router();
router.use(json());
router.route('/api/settings_notifications').get(auth, getSettingsNotifications);

export const router_notify = router;
