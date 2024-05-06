import { redisClient } from '../../config/redis.js';
import addressModel from '../../models/address.model.js';
import { checkCache, deleteCache } from '../../modules/cache.js';

export const getAllAddress = async (req, res) => {
  const user = req.decoded;
  try {
    const addressData = await checkCache(`address:${user.id}`, async () => {
      const address = await addressModel
        .find({ userId: user.id })
        .sort({ isDefault: -1 });
      await redisClient.set(`address:${user.id}`, JSON.stringify(address));
      return address;
    });
    if (addressData !== null)
      return res.status(200).json({
        error: false,
        success: true,
        address: addressData !== null ? addressData : [],
      });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const createAddress = async (req, res) => {
  const user = req.decoded;
  const { name, phone, state, city, district, address, isDefault } = req.body;

  try {
    if (!state || !city || !district || !address)
      return res
        .status(400)
        .json({ message: 'state, city, district, address are required!' });
    if (typeof isDefault !== 'boolean') {
      return res.status(400).json({
        message: 'isDefault must be a boolean value!',
      });
    }
    const userAddress = {
      userId: user.id,
      name: name,
      phone: phone,
      state: state,
      city: city,
      district: district,
      address: address.replace('.', ''),
      isDefault: isDefault,
    };
    const defaultAddress = await addressModel.findOne({ isDefault: true });
    if (defaultAddress && userAddress.isDefault) {
      defaultAddress.isDefault = false;
      await defaultAddress.save();
    }
    const createdAddress = await addressModel.create(userAddress);
    if (createdAddress) {
      await deleteCache(`address:${user.id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Create your address successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const updateAddress = async (req, res) => {
  const user = req.decoded;
  const { id } = req.params;
  const { name, phone, state, city, district, address, isDefault } = req.body;
  try {
    if (!state || !city || !district || !address)
      return res
        .status(400)
        .json({ message: 'state, city, district, address are required!' });
    const userAddress = {
      userId: user.id,
      name: name,
      phone: phone,
      district: district,
      address: address,
      isDefault: isDefault,
    };
    if (isDefault) {
      const defaultAddress = await addressModel.findOne({
        isDefault: isDefault,
      });
      defaultAddress.isDefault = false;
      await defaultAddress.save();
    }
    const updatedAddress = await addressModel.findByIdAndUpdate(
      id,
      userAddress
    );
    if (updatedAddress) {
      await deleteCache(`address:${user.id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Update your address successfully!',
      });
    }
    return res
      .status(404)
      .json({ error: true, success: false, message: 'Not found userId!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const user = req.decoded;
  try {
    const deletedAddress = await addressModel.findOneAndDelete({
      _id: id,
      userId: user.id,
    });
    if (deletedAddress) {
      await deleteCache(`address:${user.id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Delete your address successfully!',
      });
    }
    return res
      .status(404)
      .json({ error: true, success: false, message: 'Not found id!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
