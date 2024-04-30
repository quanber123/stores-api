import orderModel from '../../models/order.model.js';
import adminModel from '../../models/admin.model.js';
import statusOrderModel from '../../models/status.order.model.js';
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status, userId } = req.body;
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
    const allowRole = await statusOrderModel.findOne({
      validRole: admin.role,
      name: status,
    });
    if (allowRole.name !== 'processing') {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This update is for users only!',
      });
    }
    const updatedOrder = await orderModel.findOneAndUpdate(
      {
        user: userId,
        'paymentInfo.orderCode': Number(orderId),
      },
      {
        isProcessing: true,
        'paymentInfo.status': status,
        updated_at: Date.now(),
      },
      { new: true }
    );
    if (updatedOrder)
      return res.status(200).json({
        error: false,
        success: true,
        message: `Updated Order Successfully!`,
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found order by id: ${orderId}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllOrdersByUserId = async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
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
    const totalOrders = await orderModel.countDocuments({ user: id });
    const totalPage = Math.ceil(totalOrders / 10);
    const orders = await orderModel
      .find({ user: id })
      .sort({ created_at: -1 })
      .skip(Number(page - 1) * 10)
      .limit(10)
      .lean();
    return res.status(200).json({
      error: false,
      success: true,
      orders: orders !== null ? orders : [],
      totalPage: totalPage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderByCode = async (req, res) => {
  const { code } = req.params;
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
    const order = await orderModel
      .findOne({ 'paymentInfo.orderCode': code })
      .lean();
    if (order)
      return res
        .status(200)
        .json({ error: false, success: true, order: order });
    return res
      .status(404)
      .json({ error: true, success: false, message: 'Not Found Order!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
