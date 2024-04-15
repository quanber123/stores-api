import { Router, json } from 'express';
import { getAllBanners } from '../../controllers/users/banner.controllers.js';
const router = Router();
router.use(json());
router.route('/api/banners').get(getAllBanners);

export const router_banners = router;
