import { redisClient } from '../../config/redis.js';
import districtsModel from '../../models/districts.model.js';
import provincesModel from '../../models/provinces.model.js';
import wardsModel from '../../models/wards.model.js';
import { checkCache } from '../../modules/cache.js';

export const getAllProvinces = async (req, res) => {
  try {
    const data = await checkCache('provinces:get_all', async () => {
      const provinces = await provincesModel.find().lean();

      await redisClient.set(`provinces:get_all`, JSON.stringify(provinces));
      return provinces;
    });
    return res.status(200).json(data !== null ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllDistricts = async (req, res) => {
  try {
    const data = await checkCache('districts:get_all', async () => {
      const districts = await districtsModel.find().lean();

      await redisClient.set(`districts:get_all`, JSON.stringify(districts));
      return districts;
    });
    return res.status(200).json(data !== null ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllWards = async (req, res) => {
  try {
    const data = await checkCache('wards:get_all', async () => {
      const wards = await wardsModel.find().lean();

      await redisClient.set(`wards:get_all`, JSON.stringify(wards));
      return wards;
    });
    return res.status(200).json(data !== null ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDistrictsByProvince = async (req, res) => {
  const { provinceCode } = req.query;
  try {
    const data = await checkCache(`provinces:${provinceCode}`, async () => {
      const districts = await districtsModel.find({
        parent_code: provinceCode,
      });

      await redisClient.set(
        `provinces:${provinceCode}`,
        JSON.stringify(districts)
      );
      return districts;
    });
    return res.status(200).json(data !== null ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getWadsByDistrict = async (req, res) => {
  const { districtCode } = req.query;

  try {
    const data = await checkCache(`districts:${districtCode}`, async () => {
      const wards = await wardsModel.find({ parent_code: districtCode }).lean();

      await redisClient.set(`wards:${districtCode}`, JSON.stringify(wards));
      return wards;
    });
    return res.status(200).json(data !== null ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
