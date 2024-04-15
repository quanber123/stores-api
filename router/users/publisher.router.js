import { Router, json } from 'express';
import { getAllPublishers } from '../../controllers/users/publisher.controllers.js';
const router = Router();
router.use(json());
router.route('/api/publishers').get(getAllPublishers);

export const router_publisher = router;
