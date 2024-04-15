import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createPublisher,
  deletePublisher,
  getAllPublishers,
  updatePublisher,
} from '../../controllers/dashboard/publisher.controllers.js';
const router = Router();
router.use(json());
router
  .route('/api/dashboard/publishers')
  .get(auth, getAllPublishers)
  .post(createPublisher);

router
  .route('/api/dashboard/publishers/:id')
  .put(auth, updatePublisher)
  .delete(auth, deletePublisher);

export const router_publisher_dashboard = router;
