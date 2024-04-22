import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  adminLogin,
  getAdminByToken,
} from '../../controllers/dashboard/admin.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/admin')
  .get(auth, getAdminByToken)
  .post(adminLogin);

export const router_admin = router;
