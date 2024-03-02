import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createCart,
  deleteManyCarts,
  deleteCartById,
  getAllCarts,
  updateCart,
} from '../../controllers/cart/cart.controllers.js';
const routerCart = Router();
routerCart.use(json());
routerCart
  .route('/api/carts')
  .get(auth, getAllCarts)
  .post(auth, createCart)
  .delete(auth, deleteManyCarts);
routerCart
  .route('/api/carts/:id')
  .put(auth, updateCart)
  .delete(auth, deleteCartById);

export default routerCart;
