import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
} from '../../controllers/label/tag/tag.controllers.js';
const routerTag = Router();
routerTag.use(json());
routerTag.route('/api/tags').get(getAllTags).post(auth, createTag);
routerTag.route('/api/tags/:id').put(auth, updateTag).delete(auth, deleteTag);

export default routerTag;
