import { redisClient } from '../../config/redis.js';
import storeModel from '../../models/store/store.model.js';
import { firstLoadingCache } from '../../modules/cache.js';

// Get All Store

export const getAllStores = async (req, res) => {
  try {
    const data = await firstLoadingCache('stores:*', storeModel, null);
    if (data !== null) {
      return res.status(200).json(data);
    } else {
      const findAllStores = await storeModel
        .find()
        .skip((page - 1) * stores)
        .limit(stores)
        .lean();
      return res.status(200).json(findAllStores !== null ? findAllStores : []);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Store

export const createStore = async (req, res) => {
  const store = req.body;
  try {
    const existingStore = await storeModel.findOne({ name: store.name });
    if (existingStore) {
      return res
        .status(409)
        .json({ message: `Store name ${store} was existed!` });
    } else {
      const newStore = new storeModel(store);
      const savedStore = await newStore.save();
      await redisClient.set(
        `stores:${savedStore._id}`,
        JSON.stringify(savedStore)
      );
      return res.status(200).json(savedStore);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Store

export const updateStore = async (req, res) => {
  const { id } = req.params.id;
  const store = req.body;
  try {
    const updatedStore = await storeModel.findByIdAndUpdate({ _id: id, store });
    if (updatedStore) {
      await redisClient.set(
        `stores:${updateStore._id}`,
        JSON.stringify(updatedStore)
      );
      return res.status(200).json({ message: 'Updated Successfully!' });
    } else {
      return res.status(404).json({ message: `Not found store by id: ${id}` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Store

export const deleteStore = async (req, res) => {
  const { id } = req.params.id;
  try {
    const deletedStore = await storeModel.findByIdAndDelete(id);
    if (deletedStore) {
      await redisClient.del(`${deletedStore._id}`);
      return res.status(200).json({ message: 'Deleted Successfully!' });
    } else {
      return res.status(404).json({ message: `Not found store by id: ${id}` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
