import { Router, json } from 'express';
import { getWebsiteInfo } from '../../controllers/dashboard/web_info.controllers.js';
import { getFaqs, getPage } from '../../controllers/users/pages.controllers.js';
const router = Router();
router.use(json());
router.route('/api/web_info').get(getWebsiteInfo);
router.route('/api/pages/:page').get(getPage);
router.route('/api/faqs').get(getFaqs);
export const router_page = router;
