import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  getWebsiteDashboard,
  getWebsiteInfo,
  updateWebsite,
} from '../../controllers/dashboard/page.controllers.js';
const router = Router();
router.use(json());
router.route('/api/page').get(getWebsiteInfo);
router.route('/api/dashboard/page').get(auth, getWebsiteDashboard);
router
  .route('/api/page/:id')
  .put(auth, uploadImg.array('images'), updateWebsite);

export const router_page = router;
