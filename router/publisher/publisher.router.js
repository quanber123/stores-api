import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  createPublisher,
  deletePublisher,
  getAllPublishers,
  updatePublisher,
} from '../../controllers/publisher/publisher.controllers.js';
const routerPublisher = Router();
routerPublisher.use(json());
routerPublisher
  .route('/api/publishers')
  .get(getAllPublishers)
  .post(createPublisher);

routerPublisher
  .route('/api/publishers/:id')
  .put(updatePublisher)
  .delete(deletePublisher);

export default routerPublisher;
