import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCart,
  deleteManyCarts,
  deleteCartById,
  getAllCarts,
  updateCart,
} from '../../controllers/users/cart.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/carts')
  .get(auth, getAllCarts)
  .post(auth, createCart)
  .delete(auth, deleteManyCarts);
router
  .route('/api/carts/:id')
  .put(auth, updateCart)
  .delete(auth, deleteCartById);

export const router_cart = router;
