import cartModel from '../../models/cart/cart.model.js';
import orderModel from '../../models/order/order.model.js';
import productModel from '../../models/product/product.model.js';
import { payOs } from '../../utils/payos.js';

export const createTransferLink = async (req, res) => {
  const { user } = req.decoded;
  const client_url = process.env.CLIENT_URL;
  const { products, totalPrice, message, address } = req.body;
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
        products: products.map((p) => p.product),
        ...paymentLinkResponse,
        message: message,
        address: address,
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
  const { products, totalPrice, message, address } = req.body;
  try {
    const order = await orderModel.create({
      user: user.id,
      paymentMethod: 'cash',
      paymentInfo: {
        products: products.map((p) => p.product),
        orderCode: Number(String(Date.now()).slice(-6)),
        amount: totalPrice,
        status: 'PENDING',
        message: message,
        address: address,
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
export const getAllOrders = async (req, res) => {
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
      return res.status(200).json({ orders: findAllOrders, totalPage: total });
    return res.status(404).json({ messages: 'Not found orders in database' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getOrderById = async (req, res) => {
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
    const { user } = req.decoded;
    const { orderId } = req.params;
    const { status } = req.body;
    const updatedOrder = await orderModel.findOneAndUpdate(
      {
        user: user.id,
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
