import unidecode from 'unidecode';
import authUserModel from '../../models/auth-user.model.js';
import oauthUserModel from '../../models/oauth-user.model.js';
import orderModel from '../../models/order.model.js';
import { format } from 'date-fns';
import adminModel from '../../models/admin.model.js';
export const getTotalAmount = async (req, res) => {
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
    const today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const todayFigures = await orderModel.aggregate([
      {
        $match: {
          created_at: {
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
          created_at: {
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
          created_at: { $gte: firstDayOfMonth, $lt: today },
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
          created_at: { $gte: lastMonth, $lt: firstDayOfMonth },
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
          'paymentInfo.totalSalePrice': {
            $gt: 1,
          },
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
    return res.status(500).json({ error: error.message });
  }
};

export const getTotalFigures = async (req, res) => {
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
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

const getFiguresWeekly = (startDate, endDate, data) => {
  const result = [];
  const allDates = data.reduce((acc, order) => {
    const index = acc.findIndex((item) => item._id === order._id);
    if (index !== -1) {
      acc[index].total += order.total;
    } else {
      acc.push(order);
    }
    return acc;
  }, []);
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const index = allDates.findIndex(
      (item) => item._id === format(new Date(date), 'yyyy-MM-dd')
    );
    result.push({
      _id: format(new Date(date), 'yyyy-MM-dd'),
      total: index !== -1 ? allDates[index].total : 0,
    });
  }
  return result;
};
export const getWeeklyFigures = async (req, res) => {
  const admin = req.decoded;
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const totalSales = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
          'paymentInfo.totalSalePrice': {
            $gt: 1,
          },
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          total: { $sum: '$paymentInfo.totalSalePrice' },
        },
      },
    ]);
    const totalOrders = await orderModel.aggregate([
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: {
          path: '$paymentInfo.products',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          total: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      totalSales: getFiguresWeekly(startDate, endDate, totalSales),
      totalOrders: getFiguresWeekly(startDate, endDate, totalOrders),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBestSellingProducts = async (req, res) => {
  const admin = req.decoded;
  const auth = await adminModel.findOne({
    email: admin.email,
    role: admin.role,
  });
  if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
  try {
    const data = await orderModel.aggregate([
      {
        $match: {
          'paymentInfo.status': 'delivered',
        },
      },
      {
        $unwind: '$paymentInfo.products',
      },
      {
        $group: {
          _id: '$paymentInfo.products.category',
          total: { $sum: '$paymentInfo.products.quantity' },
        },
      },
    ]);

    return res.status(200).json(data ? data : []);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllOrders = async (req, res) => {
  const admin = req.decoded;
  const { page, search, status, order_limits, method, start_date, end_date } =
    req.query;
  let query = {};

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    if (search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query['paymentInfo.user_name'] = { $regex: regex };
    }
    if (order_limits && !start_date && !end_date) {
      const currDate = new Date();
      currDate.setHours(0, 0, 0, 0);
      currDate.setDate(currDate.getDate() - parseInt(order_limits));
      query['created_at'] = { $gte: currDate };
    }
    if (start_date && end_date && !order_limits) {
      let startDate = new Date(start_date);
      let endDate = new Date(end_date);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        query['created_at'] = { $gte: startDate, $lte: endDate };
      }
    }
    if (order_limits && start_date && end_date) {
      let startDate = new Date(start_date);
      let endDate = new Date(end_date);
      let day = new Date(endDate);
      day.setDate(endDate.getDate() - parseInt(order_limits));
      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        day < startDate
      ) {
        query['created_at'] = { $gte: day, $lte: endDate };
      } else if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        query['created_at'] = { $gte: startDate, $lte: endDate };
      }
    }
    if (status) {
      query['paymentInfo.status'] = status;
    }
    if (method) {
      query.paymentMethod = method;
    }
    const totalOrders = await orderModel.countDocuments(query);
    const totalPage = Math.ceil(totalOrders / 10);
    const data = await orderModel
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    return res.status(200).json({ orders: data || [], totalPage: totalPage });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllCustomers = async (req, res) => {
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const { page, search, type } = req.query;
    let query = {};
    let data;
    let total;
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    if (type.toLowerCase() === 'auth') {
      const totalUsers = await authUserModel.countDocuments(query);
      data = await authUserModel
        .find(query)
        .skip((Number(page) - 1) * 10)
        .limit(10);
      total = Math.ceil(totalUsers / 10);
    }
    if (type.toLowerCase() === 'oauth') {
      const totalUsers = await oauthUserModel.countDocuments(query);
      data = await oauthUserModel
        .find(query)
        .skip((Number(page) - 1) * 10)
        .limit(10);
      total = Math.ceil(totalUsers / 10);
    }

    return res
      .status(200)
      .json({ users: data !== null ? data : [], totalPage: total });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
