import cartModel from '../../models/cart.model.js';
import notificationsModel from '../../models/notifications.model.js';
import productModel from '../../models/product.model.js';
export const getAllCarts = async (req, res) => {
  const { user } = req.decoded;
  // const { currPage } = req.query;

  try {
    // const skip = (currPage - 1) * 8;
    const total = await cartModel.countDocuments({ userId: user.id });
    // const page = totalPage(total, 8);
    const existedProducts = await cartModel
      .find({ userId: user.id })
      // .skip(skip)
      // .limit(8)
      .lean();

    return res.status(200).json({ cart: existedProducts, total: total });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCart = async (req, res) => {
  const { user } = req.decoded;
  const { cart } = req.body;
  let newCart = {
    userId: user.id,
    product: {
      id: cart.productId,
      name: cart.name,
      category: cart.category,
      image: cart.image,
      color: cart.color,
      size: cart.size,
      quantity: cart.quantity,
      price: cart.price,
      discount: 0,
      salePrice: 0,
      finalPrice: 0,
      totalPrice: 0,
    },
  };

  try {
    if (!cart || !cart.name || !cart.color || !cart.size) {
      return res.status(400).json({ message: 'Invalid product information' });
    }

    const existedCart = await cartModel.findOne({
      userId: user.id,
      'product.name': cart.name,
      'product.color': cart.color,
      'product.size': cart.size,
    });
    const product = await productModel.findById(cart.productId);
    const indexCurProduct = product.details.variants.findIndex(
      (v) => v.size === cart.size && v.color === cart.color
    );
    if (existedCart !== null) {
      if (
        existedCart.product.quantity >
        product.details.variants[indexCurProduct].quantity
      ) {
        return res.status(409).json({
          message: `Quantity is greater than inventory. The number of products currently in the cart is ${existedCart.product.quantity}!`,
        });
      } else {
        existedCart.product.quantity += cart.quantity;
        existedCart.product.amountSalePrice =
          (existedCart.product.price - existedCart.product.salePrice) *
          existedCart.product.quantity;
        existedCart.product.totalPrice =
          existedCart.product.quantity * existedCart.product.finalPrice;
        await existedCart.save();
        await notificationsModel.create({
          userId: user.id,
          itemId: null,
          type: 'cart',
          url_client: `/cart`,
          message: `You have successfully added product <span class='font-bold'>${existedCart.product.name}</span> to cart.`,
        });
        return res.status(200).json({ message: 'Created Successfully!' });
      }
    }
    if (newCart.quantity > product.details.variants[indexCurProduct].quantity) {
      return res.status(409).json({
        message: `Quantity is greater than inventory!`,
      });
    }
    if (cart.salePrice > 0) {
      newCart.product['salePrice'] = cart.salePrice;
      newCart.product['discount'] = cart.discount;
      newCart.product['finalPrice'] = cart.price - cart.salePrice;
      newCart.product['totalPrice'] =
        (cart.price - cart.salePrice) * cart.quantity;
    } else {
      newCart.product['finalPrice'] = cart.price;
      newCart.product['totalPrice'] = cart.price * cart.quantity;
    }
    const createdCart = await cartModel.create(newCart);
    if (createdCart) {
      await notificationsModel.create({
        userId: user.id,
        itemId: null,
        type: 'cart',
        url_client: `/cart`,
        message: `You have successfully added product <span class='font-bold'>${createdCart.product.name}</span> to cart.`,
      });
      return res.status(200).json({ message: 'Created Successfully!' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCart = async (req, res) => {
  const id = req.params.id;
  const { product } = req.body;

  try {
    if (product.quantity === 0) {
      const deleteProduct = await cartModel.findByIdAndDelete(id);
      return res.status(200).json({
        message: `Product '${deleteProduct.product.name}' now is not in your cart!`,
      });
    }
    const checkUnAvailable = await productModel.findOne(
      {
        _id: product.id,
        'details.variants.color': product.color,
        'details.variants.size': product.size,
      },
      {
        'details.variants.$': 1,
      }
    );
    if (checkUnAvailable.details.variants[0].quantity < product.quantity) {
      return res.status(404).json({
        message: `The quantity has exceeded the product inventory by ${checkUnAvailable.details.variants[0].quantity}`,
        data: checkUnAvailable,
      });
    }
    const newProduct = {
      ...product,
      totalPrice: product.finalPrice * product.quantity,
    };
    const updatedProduct = await cartModel.findByIdAndUpdate(id, {
      product: newProduct,
    });

    if (updatedProduct)
      return res.status(200).json({
        message: `Updated product "${updatedProduct.product.name}" successfully!`,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteCartById = async (req, res) => {
  const id = req.params.id;

  try {
    const deletedProduct = await cartModel.findByIdAndDelete(id);

    if (deletedProduct)
      return res.status(200).json({
        message: `Deleted Product "${deletedProduct.product.name}" Successfully!`,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteManyCarts = async (req, res) => {
  const { products } = req.body;
  try {
    const deleteAllProducts = products.map(async (p) => {
      return await cartModel.findByIdAndDelete(p._id);
    });
    await Promise.all(deleteAllProducts);
    return res.status(200).json({ message: 'Deleted Successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
