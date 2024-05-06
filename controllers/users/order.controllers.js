import cartModel from '../../models/cart.model.js';
import notificationsModel from '../../models/notifications.model.js';
import orderModel from '../../models/order.model.js';
import productModel from '../../models/product.model.js';
import statusModel from '../../models/status.order.model.js';
import { updateCache } from '../../modules/cache.js';
import { payOs } from '../../utils/payos.js';
export const createTransferLink = async (req, res) => {
  const user = req.decoded;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  const client_url = process.env.CLIENT_URL;
  try {
    if (products.length === 0)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Products can not empty!',
      });
    for (const product of products) {
      const availableProduct = await productModel.findOne(
        {
          _id: product.product.id,
          'details.variants.color': product.product.color,
          'details.variants.size': product.product.size,
        },
        {
          'details.variants.$': 1,
        }
      );
      if (
        availableProduct.details.variants[0].availableQuantity <
        product.product.quantity
      ) {
        return res.status(409).json({
          message: `The product named ${product.product.name} has already been ordered by another user.Please check your cart again!`,
        });
      } else {
        const updatedProduct = await productModel.findOneAndUpdate(
          {
            _id: product.product.id,
            'details.variants.size': product.product.size,
            'details.variants.color': product.product.color,
          },
          {
            $inc: {
              'details.variants.$.availableQuantity': -product.product.quantity,
            },
            updated_at: Date.now(),
          },
          {
            new: true,
          }
        );
        await updateCache(`products:${updatedProduct._id}`, updatedProduct);
      }
      continue;
    }
    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: Math.round(totalPrice),
      description: 'Payment orders',
      returnUrl: `${client_url}/success?paymentMethod=transfer`,
      cancelUrl: `${client_url}/cancel?paymentMethod=transfer`,
    };
    const paymentLinkResponse = await payOs.createPaymentLink(body);
    if (!paymentLinkResponse)
      return res
        .status(403)
        .json({ message: `Error creating payment link from bank side` });
    const createdOrders = await orderModel.create({
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
          (accumulator, p) => p.product.salePrice + accumulator,
          0
        ),
      },
    });
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id)
    );
    await Promise.all(updatedCarts);
    await notificationsModel.create({
      userId: user.id,
      itemId: createdOrders.paymentInfo.orderCode,
      type: 'product',
      url_client: `/account/orders/${createdOrders.paymentInfo.orderCode}`,
      message: `You have successfully created order number <span class="font-bold">${createdOrders.paymentInfo.orderCode}</span>.`,
    });
    return res
      .status(200)
      .json({ error: false, success: true, order: createdOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const createCashPayment = async (req, res) => {
  const user = req.decoded;
  const { user_name, phone, message, address, products, totalPrice } = req.body;
  try {
    if (products.length === 0)
      return res.status(400).json({
        error: true,
        success: false,
        message: 'Products can not empty!',
      });
    for (const product of products) {
      const availableProduct = await productModel.findOne(
        {
          _id: product.product.id,
          'details.variants.color': product.product.color,
          'details.variants.size': product.product.size,
        },
        {
          'details.variants.$': 1,
        }
      );
      if (
        availableProduct.details.variants[0].availableQuantity <
        product.product.quantity
      ) {
        return res.status(409).json({
          error: true,
          success: false,
          message: `The product named ${product.product.name} has already been ordered by another user. Please check your cart again!`,
        });
      } else {
        const updatedProduct = await productModel.findOneAndUpdate(
          {
            _id: product.product.id,
            'details.variants.size': product.product.size,
            'details.variants.color': product.product.color,
          },
          {
            $inc: {
              'details.variants.$.availableQuantity': -product.product.quantity,
            },
            updated_at: Date.now(),
          },
          {
            new: true,
          }
        );
        await updateCache(`products:${updatedProduct._id}`, updatedProduct);
      }
      continue;
    }
    const createdOrders = await orderModel.create({
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
        amount: math.round(totalPrice),
        status: 'pending',
        totalPrice: products.reduce(
          (accumulator, p) => Math.round(p.product.totalPrice) + accumulator,
          0
        ),
        totalSalePrice: products.reduce(
          (accumulator, p) => p.product.salePrice + accumulator,
          0
        ),
      },
    });
    const updatedCarts = products.map(
      async (p) => await cartModel.findByIdAndDelete(p._id)
    );
    await Promise.all(updatedCarts);
    await notificationsModel.create({
      userId: user.id,
      itemId: createdOrders.paymentInfo.orderCode,
      type: 'product',
      url_client: `/account/orders/${createdOrders.paymentInfo.orderCode}`,
      message: `You have successfully created order number <span class="font-bold">${createdOrders.paymentInfo.orderCode}</span>.`,
    });
    return res
      .status(200)
      .json({ error: false, success: true, order: createdOrders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllOrdersUser = async (req, res) => {
  const user = req.decoded;
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
    const total = Math.ceil(totalOrders / 6);
    const findAllOrders = await orderModel
      .find(query)
      .sort({ updated_at: -1 })
      .skip((page - 1) * 6)
      .limit(6)
      .lean();
    if (findAllOrders)
      return res.status(200).json({
        error: false,
        success: true,
        orders: findAllOrders !== null ? findAllOrders : [],
        totalPage: total,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getOrdersUserById = async (req, res) => {
  const user = req.decoded;
  const { orderId } = req.params;
  try {
    const order = await orderModel
      .findOne({
        user: user.id,
        'paymentInfo.orderCode': orderId,
      })
      .lean();
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
  const user = req.decoded;
  const { orderId } = req.params;
  const { status, isPaid } = req.body;

  try {
    const allowRole = await statusModel.findOne({
      validRole: user.type,
      name: status,
    });
    if (!allowRole)
      return res.status(403).json({
        error: true,
        success: false,
        message: 'This update is for admin only!',
      });
    const curOrder = await orderModel.findOne({
      user: user.id,
      'paymentInfo.orderCode': Number(orderId),
      isPaid: false,
    });
    if (!curOrder.isPaid) {
      const updatedOrder = await orderModel.findOneAndUpdate(
        {
          user: user.id,
          'paymentInfo.orderCode': Number(orderId),
        },
        {
          isPaid: isPaid ? isPaid : false,
          'paymentInfo.status': status,
          updated_at: Date.now(),
        },
        { new: true }
      );
      if (
        allowRole.name === 'cancel' &&
        updatedOrder.paymentMethod === 'transfer'
      ) {
        await payOs.cancelPaymentLink(orderId, status.cancellationReason);
      }

      if (allowRole.name === 'delivered') {
        const productUpdates = updatedOrder.paymentInfo.products.map(
          async (p) => {
            await productModel.findOneAndUpdate(
              {
                _id: p.id,
                'details.variants.size': p.size,
                'details.variants.color': p.color,
              },
              {
                $inc: {
                  'details.variants.$.quantity': -p.quantity,
                },
              }
            );
          }
        );

        await Promise.all(productUpdates);
      }
      await notificationsModel.create({
        userId: user.id,
        itemId: updatedOrder.paymentInfo.orderCode,
        type: 'product',
        url_client: `/account/orders/${updatedOrder.paymentInfo.orderCode}`,
        message: `You have successfully updated order number <span class="font-bold">${createdOrders.paymentInfo.orderCode}</span>.`,
      });
      return res.status(200).json({
        error: false,
        success: true,
        message: `Updated Order Successfully!`,
      });
    }
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
