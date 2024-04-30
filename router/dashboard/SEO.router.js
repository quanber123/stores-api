import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getSeo,
  getSeoDashboard,
  getSeoDetailsPage,
  updateSeo,
} from '../../controllers/dashboard/SEO.controllers.js';
const router = Router();
router.use(json());
router.route('/api/seo/:curPage').get(getSeo);
router.route('/api/seo_details_page/:id').get(getSeoDetailsPage);
router.route('/api/dashboard/seo').get(getSeoDashboard);
router.route('/api/dashboard/seo/:page').put(auth, updateSeo);

export const router_seo = router;
