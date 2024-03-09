import orderModel from '../../models/order/order.model.js';

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
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.totalPrice' },
          currency: { $first: '$paymentInfo.currency' },
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
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.totalPrice' },
          currency: { $first: '$paymentInfo.currency' },
        },
      },
    ]);
    const thisMonthFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: { $gte: firstDayOfMonth, $lt: today },
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.totalPrice' },
          currency: { $first: '$paymentInfo.currency' },
        },
      },
    ]);
    const lastMonthFigures = await orderModel.aggregate([
      {
        $match: {
          updated_at: { $gte: lastMonth, $lt: firstDayOfMonth },
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.totalPrice' },
          currency: { $first: '$paymentInfo.currency' },
        },
      },
    ]);
    const allSaleTimes = await orderModel.aggregate([
      {
        $match: {
          'paymentInfo.status': 'delivered',
          'paymentInfo.totalSalePrice': { $gt: 0 },
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentInfo.totalSalePrice' },
          currency: { $first: '$paymentInfo.currency' },
        },
      },
    ]);
    const [
      amountToday,
      amountYesterday,
      amountThisMonth,
      amountLastMonth,
      amountAllSalesTime,
    ] = await Promise.all([
      todayFigures,
      yesterdayFigures,
      thisMonthFigures,
      lastMonthFigures,
      allSaleTimes,
    ]);
    return res.status(200).json({
      amountToday: amountToday,
      amountYesterday: amountYesterday,
      amountThisMonth: amountThisMonth,
      amountLastMonth: amountLastMonth,
      amountAllSalesTime: amountAllSalesTime,
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

function getStartOfWeek(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getEndOfWeek(date) {
  const endOfWeek = new Date(date);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

export const getWeeklySales = async (req, res) => {
  const startDate = getStartOfWeek(new Date());
  const endDate = getEndOfWeek(new Date());
  const data = await orderModel.aggregate([
    {
      $match: {
        updated_at: {
          $gte: startDate,
          $lte: endDate,
        },
        totalSalePrice: {
          $gt: 1,
        },
        status: 'delivered',
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: '$updated_at' },
        totalValue: { $sum: '$totalSalePrice' },
      },
    },
  ]);
  return res.status(200).json(data);
};
