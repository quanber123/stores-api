import { redisClient } from '../../config/redis.js';
import storeModel from '../../models/store.model.js';
import { deleteCache, updateCache } from '../../modules/cache.js';

// Get All Store

export const getAllStores = async (req, res) => {
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const findAllStores = await storeModel.find().lean();
    return res.status(200).json({
      error: false,
      success: true,
      stores: findAllStores !== null ? findAllStores : [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Store

export const createStore = async (req, res) => {
  const store = req.body;
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
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
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const updatedStore = await storeModel.findByIdAndUpdate(id, store);

    if (updatedStore) {
      await updateCache(`stores:${updateStore._id}`, updatedStore);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated Successfully!',
      });
    } else {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found store by id: ${id}`,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Store

export const deleteStore = async (req, res) => {
  const { id } = req.params.id;
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const deletedStore = await storeModel.findByIdAndDelete(id);

    if (deletedStore) {
      await deleteCache(`stores:${deletedStore._id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted Successfully!',
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found store by id: ${id}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
