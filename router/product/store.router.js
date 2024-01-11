import { Router, json } from 'express';
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} from '../../controllers/product/store.controllers.js';
import { auth } from '../../middleware/auth.js';
const routerStore = Router();
routerStore.use(json());
routerStore.route('/api/stores').get(getAllStores).post(createStore);
routerStore.route('/api/stores/:id').put(updateStore).delete(deleteStore);

export default routerStore;
