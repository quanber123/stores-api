import cartModel from '../../models/product/cart.model.js';

export const getAllCarts = async (req, res) => {
  const { user } = req.decoded;
  try {
    const total = await cartModel.countDocuments({ userId: user._id });
    const existedProducts = await cartModel.find({ userId: user._id }).lean();
    if (existedProducts)
      return res.status(200).json({ cart: existedProducts, total: total });
    return res.status(409).json({ message: 'Your cart now is empty!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCart = async (req, res) => {
  const { user } = req.decoded;
  const { cart } = req.body;

  try {
    if (!cart || !cart.name || !cart.color || !cart.size) {
      return res.status(400).json({ message: 'Invalid product information' });
    }

    const existedCart = await cartModel.findOne({
      userId: user._id,
      'product.name': cart.name,
      'product.color': cart.color,
      'product.size': cart.size,
    });

    if (existedCart) {
      existedCart.product.quantity += cart.quantity;
      existedCart.product.amountSalePrice =
        (existedCart.product.price - existedCart.product.salePrice) *
        existedCart.product.quantity;
      existedCart.product.totalPrice =
        existedCart.product.quantity * existedCart.product.finalPrice;
      await existedCart.save();
      return res.status(200).json({ message: 'Created Successfully!' });
    }

    await cartModel.create({ userId: user._id, product: cart });
    return res.status(200).json({ message: 'Created Successfully!' });
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
