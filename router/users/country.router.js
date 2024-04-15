import { Router, json } from 'express';
import {
  getAllDistricts,
  getAllProvinces,
  getAllWards,
  getDistrictsByProvince,
  getWadsByDistrict,
} from '../../controllers/users/country.controllers.js';
const router = Router();
router.use(json());
router.route('/api/provinces/getAll').get(getAllProvinces);
router.route('/api/districts/getAll').get(getAllDistricts);
router.route('/api/districts/getByProvince').get(getDistrictsByProvince);
router.route('/api/wards/getAll').get(getAllWards);
router.route('/api/wards/getByDistrict').get(getWadsByDistrict);
export const router_country = router;
