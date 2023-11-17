import { Router, json } from 'express';
import { auth } from '../middleware/auth.js';
import { config } from '../utils/importFile.js';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tag.controllers.js';
config();
const routerTag = Router();
const end_point = process.env.END_POINT_TAG;
routerTag.use(json());
routerTag
  .route(end_point)
  .get(getAllTags)
  .post(createTag)
  .put(updateTag)
  .delete(deleteTag);

export default routerTag;
