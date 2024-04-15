import { Router, json } from 'express';
import { createContact } from '../../controllers/users/contact.controllers.js';
const router = Router();
router.use(json());
router.route('/contact').post(createContact);
export const router_contact = router;
