import { firstLoadingCache } from '../../modules/cache.js';
import statusOrderModel from '../../models/status.order.model.js';
export const getAllStatusOrder = async (req, res) => {
  try {
    const data = await firstLoadingCache(
      'statusorders:*',
      statusOrderModel,
      null,
      { number: 1 }
    );
    if (data !== null) {
      return res
        .status(200)
        .json({ error: false, success: true, status: data });
    } else {
      const getData = await statusOrderModel.find().sort({ number: 1 }).lean();
      return res
        .status(200)
        .json({
          error: false,
          success: true,
          status: getData !== null ? getData : [],
        });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
