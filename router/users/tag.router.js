import { Router, json } from 'express';
import { getAllTags } from '../../controllers/users/tag.controllers.js';
const router = Router();
router.use(json());
router.route('/api/tags').get(getAllTags);
export const router_tag = router;
