import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  getSeo,
  getSeoDetailsPage,
  setSeo,
} from '../../controllers/dashboard/SEO.controllers.js';
const router = Router();
router.use(json());
router.route('/api/seo/:curPage').get(getSeo);
router.route('/api/seo_details_page/:id').get(getSeoDetailsPage);
router.route('/api/seo').post(auth, uploadImg.array('images'), setSeo);

export const router_seo = router;
