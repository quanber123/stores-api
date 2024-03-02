import addressModel from '../../../models/auth/users/address.model.js';

export const getAllAddress = async (req, res) => {
  const { user } = req.decoded;
  try {
    const address = await addressModel
      .find({ userId: user._id })
      .sort({ isDefault: -1 });
    if (address) return res.status(200).json(address);
    return res.status(404).json({ message: 'Not found addresses!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const createAddress = async (req, res) => {
  const { user } = req.decoded;
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
      userId: user._id,
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
    await addressModel.create(userAddress);
    return res
      .status(200)
      .json({ message: 'Create your address successfully!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const updateAddress = async (req, res) => {
  const { user } = req.decoded;
  const { id } = req.params;
  const { name, phone, state, city, district, address, isDefault } = req.body;
  try {
    if (!state || !city || !district || !address)
      return res
        .status(400)
        .json({ message: 'state, city, district, address are required!' });
    const userAddress = {
      userId: user._id,
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
    if (updatedAddress)
      return res
        .status(200)
        .json({ message: 'Update your address successfully!' });
    return res.status(404).json({ message: 'Not found userId!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAddress = await addressModel.findByIdAndDelete(id);
    if (deletedAddress)
      return res
        .status(200)
        .json({ message: 'Delete your address successfully!' });
    return res.status(404).json({ message: 'Not found id!' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
