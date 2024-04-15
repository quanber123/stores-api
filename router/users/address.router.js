import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createAddress,
  deleteAddress,
  getAllAddress,
  updateAddress,
} from '../../controllers/users/address.controllers.js';

const router = Router();
router.use(json());

router.route('/address').get(auth, getAllAddress).post(auth, createAddress);
router
  .route('/address/:id')
  .put(auth, updateAddress)
  .delete(auth, deleteAddress);

export const router_address = router;
