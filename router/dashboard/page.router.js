import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  getWebsiteDashboard,
  updateWebsite,
} from '../../controllers/dashboard/web_info.controllers.js';
import {
  createFaq,
  deleteFaq,
  getFaqs,
  getPage,
  updateFaq,
  updatePage,
} from '../../controllers/dashboard/pages.controllers.js';
const router = Router();
router.use(json());
router.route('/api/dashboard/web_info').get(auth, getWebsiteDashboard);
router
  .route('/api/dashboard/web_info/:id')
  .put(auth, uploadImg.array('images'), updateWebsite);
router
  .route('/api/dashboard/pages/:page')
  .get(auth, getPage)
  .put(auth, updatePage);
router.route('/api/dashboard/faqs').get(auth, getFaqs).post(auth, createFaq);
router
  .route('/api/dashboard/faqs/:id')
  .put(auth, updateFaq)
  .delete(auth, deleteFaq);
export const router_page_dashboard = router;
