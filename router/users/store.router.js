import { Router, json } from 'express';
import { getAllStores } from '../../controllers/users/store.controllers.js';

const router = Router();
router.use(json());
router.route('/api/stores').get(getAllStores);

export const router_store = router;
