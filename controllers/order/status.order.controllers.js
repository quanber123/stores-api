import { firstLoadingCache } from '../../modules/cache.js';
import statusOrderModel from '../../models/order/status.order.model.js';
import { redisClient } from '../../config/redis.js';
export const getAllStatusOrder = async (req, res) => {
  try {
    const data = await firstLoadingCache(
      'statusorders:*',
      statusOrderModel,
      null,
      { number: 1 }
    );
    if (data !== null) {
      return res.status(200).json(data);
    } else {
      const getData = await statusOrderModel.find().sort({ number: 1 }).lean();
      return res.status(200).json(getData !== null ? getData : []);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStatusOrder = async (req, res) => {
  const status = req.body;

  try {
    const existedStatus = await statusOrderModel.findOne({ name: status.name });
    if (existedStatus) {
      return res
        .status(409)
        .json({ message: `Status name ${status.name} was existed!` });
    } else {
      const newStatus = new statusOrderModel(status);
      const savedStatus = await newStatus.save();
      await redisClient.set(
        `statusorders:${savedStatus._id}`,
        JSON.stringify(savedStatus)
      );
      return res.status(200).json(savedStatus);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStatusOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStatus = await statusOrderModel.findByIdAndDelete(id);
    if (deletedStatus) {
      await redisClient.del(`statusorders:${deletedStatus._id}`);
      return res.status(200).json({ message: 'Deleted Successfully!' });
    }
    return res
      .status(404)
      .json({ message: `Not found status order by id: ${id}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
