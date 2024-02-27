import orderModel from '../../models/product/order.model.js';

export const getTotalAmount = async (req, res) => {
  try {
    const today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const todayFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.products.finalPrice' },
        },
      },
    ]);
    const yesterdayFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: {
            $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            $lt: new Date(yesterday.setHours(23, 59, 59, 999)),
          },
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.products.finalPrice' },
        },
      },
    ]);
    const thisMonthFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: { $gte: firstDayOfMonth, $lt: today },
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.products.finalPrice' },
        },
      },
    ]);
    const lastMonthFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: { $gte: lastMonth, $lt: firstDayOfMonth },
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.products.finalPrice' },
        },
      },
    ]);
    const [amountToday, amountYesterday, amountThisMonth, amountLastMonth] =
      await Promise.all([
        todayFigures,
        yesterdayFigures,
        thisMonthFigures,
        lastMonthFigures,
      ]);
    return res.status(200).json({
      amountToday: amountToday,
      amountYesterday: amountYesterday,
      amountThisMonth: amountThisMonth,
      amountLastMonth: amountLastMonth,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTotalFigures = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({
      'paymentInfo.status': 'pending',
    });
    const processingOrders = await orderModel.countDocuments({
      'paymentInfo.status': 'processing',
    });
    const deliveredOrders = await orderModel.countDocuments({
      'paymentInfo.status': 'delivered',
    });
    const [total, pending, processing, delivered] = await Promise.all([
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
    ]);
    return res.status(200).json({
      totalOrders: total,
      pendingOrders: pending,
      processingOrders: processing,
      deliveredOrders: delivered,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
