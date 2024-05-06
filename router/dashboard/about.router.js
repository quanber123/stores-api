import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { uploadImg } from '../../middleware/uploadImg.js';
import {
  deleteAbout,
  getAbout,
  postAbout,
  updateAbout,
} from '../../controllers/dashboard/about.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/about_us')
  .get(auth, getAbout)
  .post(auth, uploadImg.single('image'), postAbout);
router
  .route('/api/dashboard/about_us/:id')
  .put(auth, uploadImg.single('image'), updateAbout)
  .delete(auth, deleteAbout);
export const router_about_dashboard = router;
