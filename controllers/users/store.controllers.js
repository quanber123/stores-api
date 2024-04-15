import storeModel from '../../models/store.model.js';
import { firstLoadingCache } from '../../modules/cache.js';

// Get All Store

export const getAllStores = async (req, res) => {
  try {
    const data = await firstLoadingCache('stores:*', storeModel, null);
    if (data !== null) {
      return res
        .status(200)
        .json({ error: false, success: true, stores: data });
    } else {
      const findAllStores = await storeModel.find().lean();
      return res.status(200).json({
        error: false,
        success: true,
        stores: findAllStores !== null ? findAllStores : [],
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
