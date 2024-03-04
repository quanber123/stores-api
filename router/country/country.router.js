import { Router, json } from 'express';
import {
  getAllDistricts,
  getAllProvinces,
  getAllWards,
  getDistrictsByProvince,
  getWadsByDistrict,
} from '../../controllers/country/country.controllers.js';
const routerCountry = Router();
routerCountry.use(json());
routerCountry.route('/api/provinces/getAll').get(getAllProvinces);
routerCountry.route('/api/districts/getAll').get(getAllDistricts);
routerCountry.route('/api/districts/getByProvince').get(getDistrictsByProvince);
routerCountry.route('/api/wards/getAll').get(getAllWards);
routerCountry.route('/api/wards/getByDistrict').get(getWadsByDistrict);
export default routerCountry;
