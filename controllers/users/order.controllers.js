import cartModel from '../../models/cart.model.js';
import orderModel from '../../models/order.model.js';
import productModel from '../../models/product.model.js';
import { payOs } from '../../utils/payos.js';
import mongoose from 'mongoose';
export const createTransferLink = async (req, res) => {
  const { user } = req.decoded;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  const client_url = process.env.CLIENT_URL;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const product of products) {
      const availableProduct = await productModel
        .findOne(
          {
            _id: product.product.id,
            'details.variants.color': product.product.color,
            'details.variants.size': product.product.size,
          },
          {
            'details.variants.$': 1,
          }
        )
        .session(session);
      if (
        availableProduct.details.variants[0].availableQuantity <
        product.product.quantity
      ) {
        return res.status(409).json({
          message: `The product named ${product.product.name} has already been ordered by another user.Please check your cart again!`,
        });
      } else {
        await productModel
          .findOneAndUpdate(
            {
              _id: product.id,
              'details.variants.size': product.size,
              'details.color': product.color,
            },
            {
              $inc: {
                'details.variants.$.availableQuantity': -product.quantity,
              },
            }
          )
          .session(session);
      }
      continue;
    }
    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: totalPrice,
      description: 'Payment orders',
      returnUrl: `${client_url}/success?paymentMethod=transfer`,
      cancelUrl: `${client_url}/cancel?paymentMethod=transfer`,
    };
    const paymentLinkResponse = await payOs.createPaymentLink(body);
    if (!paymentLinkResponse)
      return res
        .status(403)
        .json({ message: `Error creating payment link from bank side` });
    const createdOrders = await orderModel.create(
      {
        user: user.id,
        paymentMethod: 'transfer',
        isPaid: false,
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
      },
      {
        session: session,
      }
    );
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id).session(session)
    );
    await Promise.all(updatedCarts);
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(createdOrders);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const createCashPayment = async (req, res) => {
  const { user } = req.decoded;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const product of products) {
      const availableProduct = await productModel
        .findOne(
          {
            _id: product.product.id,
            'details.variants.color': product.product.color,
            'details.variants.size': product.product.size,
          },
          {
            'details.variants.$': 1,
          }
        )
        .session(session);
      if (
        availableProduct.details.variants[0].availableQuantity <
        product.product.quantity
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({
          message: `The product named ${product.product.name} has already been ordered by another user. Please check your cart again!`,
        });
      } else {
        await productModel
          .findOneAndUpdate(
            {
              _id: product.id,
              'details.variants.size': product.size,
              'details.color': product.color,
            },
            {
              $inc: {
                'details.variants.$.availableQuantity': -product.quantity,
              },
            }
          )
          .session(session);
      }
      continue;
    }
    const createdOrders = await orderModel.create(
      [
        {
          user: user.id,
          paymentMethod: 'cash',
          isPaid: false,
          paymentInfo: {
            user_name: user_name,
            phone: phone,
            message: message,
            address: address,
            products: products.map((p) => p.product),
            orderCode: Number(String(Date.now()).slice(-6)),
            amount: totalPrice,
            status: 'pending',
            totalPrice: products.reduce(
              (accumulator, p) => p.product.totalPrice + accumulator,
              0
            ),
            totalSalePrice: products.reduce(
              (accumulator, p) => p.product.amountSalePrice + accumulator,
              0
            ),
          },
        },
      ],
      { session: session }
    );
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id).session(session)
    );
    await Promise.all(updatedCarts);
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(createdOrders);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ message: error.message });
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
      return res.status(200).json({
        error: false,
        success: true,
        data: order,
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found order ${orderId}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { user } = req.decoded;
  const { orderId } = req.params;
  const { status } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const curOrder = await orderModel.findOne({
      user: user.id,
      'paymentInfo.orderCode': Number(orderId),
    });

    if (curOrder.isProcessing && curOrder.paymentMethod !== 'transfer') {
      const updatedOrder = await orderModel
        .findOneAndUpdate(
          {
            user: user.id,
            'paymentInfo.orderCode': Number(orderId),
          },
          {
            'paymentInfo.status': status,
            updated_at: Date.now(),
          },
          { new: true }
        )
        .session(session);

      if (status === 'delivered') {
        const productUpdates = updatedOrder.paymentInfo.products.map(
          async (p) => {
            await productModel
              .findOneAndUpdate(
                {
                  _id: p.id,
                  'details.variants.size': p.size,
                  'details.variants.color': p.color,
                },
                { $inc: { 'details.variants.$.quantity': -p.quantity } }
              )
              .session(session);
          }
        );

        await Promise.all(productUpdates);
      }

      await session.commitTransaction();
      session.endSession();
      if (status === 'cancel' && updatedOrder.paymentMethod === 'transfer') {
        await payOs.cancelPaymentLink(orderId, status.cancellationReason);
      }

      return res.status(200).json({
        error: false,
        success: true,
        message: `Updated Order Successfully!`,
      });
    }

    return res.status(403).json({
      error: true,
      success: false,
      message:
        'You cannot update an order if the seller has not yet processed it',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderByCode = async (req, res) => {
  const { code } = req.params;
  try {
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
