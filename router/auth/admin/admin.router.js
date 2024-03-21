import { auth } from '../../../middleware/auth.js';
import { Router, json } from 'express';
import { uploadImg } from '../../../middleware/uploadImg.js';

import {
  adminLogin,
  getAdminByToken,
} from '../../../controllers/auth/admin/admin.controllers.js';
const routerAdmin = Router();
routerAdmin.use(json());
routerAdmin.route('/api/admin').get(auth, getAdminByToken).post(adminLogin);
export default routerAdmin;
