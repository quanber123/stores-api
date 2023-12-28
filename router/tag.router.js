import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tag.controllers.js';
const routerTag = Router();
routerTag.use(json());
routerTag
  .route('/api/tags')
  .get(getAllTags)
  .post(createTag)
  .put(updateTag)
  .delete(deleteTag);

export default routerTag;
