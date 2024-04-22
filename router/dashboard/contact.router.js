import { Router, json } from 'express';
import { auth } from '../../middleware/auth.js';
import { getAllContacts } from '../../controllers/dashboard/contact.controllers.js';
const router = Router();
router.use(json());
router.route('/dashboard/contact').get(auth, getAllContacts);
export const router_contact_dashboard = router;
