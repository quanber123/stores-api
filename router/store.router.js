import { Router, json } from 'express';
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} from '../controllers/store.controllers.js';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
config();
const routerStore = Router();
routerStore.use(json());
const end_point = process.env.END_POINT_STORE;

routerStore
  .route(end_point)
  .get(getAllStores)
  .post(createStore)
  .put(updateStore)
  .delete(deleteStore);

export default routerStore;
