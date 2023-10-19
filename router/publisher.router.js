import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import {
  createPublisher,
  deletePublisher,
  getAllPublishers,
  updatePublisher,
} from '../controllers/publisher.controllers';
config();
const routerPublisher = Router();
const end_point = process.env.END_POINT_PUBLISHER;
routerPublisher.use(json());
routerPublisher
  .route(end_point)
  .get(getAllPublishers)
  .post(createPublisher)
  .put(updatePublisher)
  .delete(deletePublisher);

export default routerPublisher;
