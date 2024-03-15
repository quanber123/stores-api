import cartModel from '../../models/cart/cart.model.js';
import orderModel from '../../models/order/order.model.js';
import productModel from '../../models/product/product.model.js';
import { payOs } from '../../utils/payos.js';

export const createTransferLink = async (req, res) => {
  const { user } = req.decoded;
  const client_url = process.env.CLIENT_URL;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  try {
    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: totalPrice,
      description: 'Payment orders',
      returnUrl: `${client_url}/success?paymentMethod=transfer`,
      cancelUrl: `${client_url}/cancel`,
    };
    const paymentLinkResponse = await payOs.createPaymentLink(body);
    await orderModel.create({
      user: user.id,
      paymentMethod: 'transfer',
      paymentInfo: {
        user_name: user_name,
        phone: phone,
        message: message,
        address: address,
        products: products.map((p) => p.product),
        ...paymentLinkResponse,
        totalPrice: products.reduce(
          (accumulator, p) => p.product.totalPrice + accumulator,
          0
        ),
        totalSalePrice: products.reduce(
          (accumulator, p) => p.product.amountSalePrice + accumulator,
          0
        ),
      },
    });
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id)
    );
    await Promise.all(updatedCarts);
    return res.status(200).json(paymentLinkResponse);
  } catch (error) {
    console.error(error);
    res.send('Something went error');
  }
};

export const createCashPayment = async (req, res) => {
  const { user } = req.decoded;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  try {
    const order = await orderModel.create({
      user: user.id,
      paymentMethod: 'cash',
      paymentInfo: {
        user_name: user_name,
        phone: phone,
        message: message,
        address: address,
        products: products.map((p) => p.product),
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: totalPrice,
        status: 'PENDING',
        totalPrice: products.reduce(
          (accumulator, p) => p.product.totalPrice + accumulator,
          0
        ),
        totalSalePrice: products.reduce(
          (accumulator, p) => p.product.amountSalePrice + accumulator,
          0
        ),
      },
    });
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id)
    );
    await Promise.all(updatedCarts);
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.send('Something went error');
  }
};
export const getAllOrdersUser = async (req, res) => {
  const { user } = req.decoded;
  const { page, status } = req.query;
  let query = {};
  try {
    if (status) {
      query = {
        user: user.id,
        'paymentInfo.status': status,
      };
    } else {
      query = {
        user: user.id,
      };
    }
    const totalOrders = await orderModel.countDocuments(query);
    const total = Math.ceil(totalOrders / 8);
    const findAllOrders = await orderModel
      .find(query)
      .sort({ updated_at: -1 })
      .skip((page - 1) * 8)
      .limit(8)
      .lean();
    if (findAllOrders)
      return res.status(200).json({
        orders: findAllOrders !== null ? findAllOrders : [],
        totalPage: total,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getOrdersUserById = async (req, res) => {
  const { user } = req.decoded;
  const { orderId } = req.params;
  const { payment } = req.query;
  let order;
  try {
    if (!payment) return res.status(400).json({ message: 'Bad Request!' });
    if (payment === 'transfer') {
      order = await payOs.getPaymentLinkInformation(orderId);
    } else {
      order = await orderModel
        .findOne({
          user: user.id,
          'paymentInfo.orderCode': orderId,
        })
        .lean();
    }
    if (order) {
      return res.json({
        error: 0,
        message: 'ok',
        data: order,
      });
    }
    return res.json({
      error: -1,
      message: 'failed',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userId } = req.body;
    const updatedOrder = await orderModel.findOneAndUpdate(
      {
        user: userId,
        'paymentInfo.orderCode': Number(orderId),
      },
      {
        'paymentInfo.status': status,
        updated_at: Date.now(),
      },
      { new: true }
    );
    if (status === 'delivered') {
      const updatedProducts = updatedOrder.paymentInfo.products.map(
        async (p) =>
          await productModel.findOneAndUpdate(
            {
              _id: p.id,
              'details.variants.size': p.size,
              'details.variants.color': p.color,
            },
            {
              $inc: { 'details.variants.$.quantity': -p.quantity },
            }
          )
      );
      await Promise.all(updatedProducts);
    }
    if (updatedOrder && updatedOrder.paymentMethod === 'transfer') {
      await payOs.cancelPaymentLink(orderId, status.cancellationReason);
    }

    if (updatedOrder)
      return res.status(200).json({ message: `${status} Order Successfully!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllOrdersByUsersId = async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;
  try {
    const totalOrders = await orderModel.countDocuments({ user: id });
    const totalPage = Math.ceil(totalOrders / 10);
    const orders = await orderModel
      .find({ user: id })
      .sort({ created_at: -1 })
      .skip(Number(page - 1) * 10)
      .limit(10)
      .lean();
    return res
      .status(200)
      .json({ orders: orders !== null ? orders : [], totalPage: totalPage });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const order = await orderModel
      .findOne({ 'paymentInfo.orderCode': code })
      .lean();
    if (order) return res.status(200).json(order);
    return res.status(404).json({ message: 'Not Found Order!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
