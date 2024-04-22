import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import { getSeo, setSeo } from '../../controllers/dashboard/SEO.controllers.js';
const router = Router();
router.use(json());
router.route('/seo/:curPage').get(getSeo);
router.route('/seo').post(auth, uploadImg.array('icon'), setSeo);

export const router_seo = router;
