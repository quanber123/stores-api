import storeModel from '../models/store.model.js';

// Get All Store

export const getAllStores = async (req, res) => {
  const { stores, page } = req.query;
  try {
    const totalStores = await storeModel.countDocuments();
    const total = Math.ceil(totalStores / stores);
    const findAllStores = await storeModel
      .find()
      .skip((page - 1) * stores)
      .limit(stores);
    if (findAllStores) {
      return res.status(200).json({ stores: findAllStores, totalPage: total });
    } else {
      return res.status(404).json({ message: 'Not found stores in database' });
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
    const existingStore = await storeModel.findById(id);
    if (existingStore) {
      return res.status(404).json({ message: `Not found store by id: ${id}` });
    } else {
      const updatedStore = await storeModel.findById({ _id: id, store });
      return res.status(200).json(updatedStore);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Store

export const deleteStore = async (req, res) => {
  const { id } = req.params.id;
  try {
    const existingStore = await storeModel.findById(id);
    if (existingStore) {
      return res.status(404).json({ message: `Not found store by id: ${id}` });
    } else {
      const deletedStore = await storeModel.findByIdAndDelete(id);
      return res.status(200).json(deletedStore);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
