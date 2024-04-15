import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createStore,
  deleteStore,
  getAllStores,
  updateStore,
} from '../../controllers/dashboard/store.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/stores')
  .get(auth, getAllStores)
  .post(auth, createStore);
router
  .route('/api/dashboard/stores/:id')
  .put(auth, updateStore)
  .post(auth, deleteStore);
export const router_store_dashboard = router;
