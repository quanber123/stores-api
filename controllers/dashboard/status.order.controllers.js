import statusOrderModel from '../../models/status.order.model.js';
import { redisClient } from '../../config/redis.js';
import { deleteCache } from '../../modules/cache.js';
export const getAllStatusOrder = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const getData = await statusOrderModel.find().sort({ number: 1 }).lean();
    return res.status(200).json({
      error: false,
      success: true,
      status: getData !== null ? getData : [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStatusOrder = async (req, res) => {
  const status = req.body;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const existedStatus = await statusOrderModel.findOne({
      name: status.name,
    });
    if (existedStatus) {
      return res.status(409).json({
        error: true,
        success: false,
        message: `Status name ${status.name} was existed!`,
      });
    } else {
      const createdStatus = await statusOrderModel.create(status);
      await redisClient.set(
        `statusorders:${createdStatus._id}`,
        JSON.stringify(createdStatus)
      );
      return res
        .status(200)
        .json({ error: true, success: false, status: createdStatus });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStatusOrder = async (req, res) => {
  const { id } = req.params;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const deletedStatus = await statusOrderModel.findByIdAndDelete(id);
    if (deletedStatus) {
      await deleteCache(`statusorders:${deletedStatus._id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted Successfully!',
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found status order by id: ${id}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
