import cartModel from '../../models/product/cart.model.js';

export const getAllCarts = async (req, res) => {
  const { user } = req.decoded;
  try {
    const existedProducts = await cartModel.find({ userId: user._id });
    if (existedProducts) return res.status(200).json(existedProducts);
    return res.status(409).json({ message: 'Your cart now is empty!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCart = async (req, res) => {
  const { user } = req.decoded;
  const { cart } = req.body;
  try {
    const existedCart = await cartModel.findOne({ userId: userId });
    if (existedCart) {
      const { name, color, size } = existedCart.product;
      if (name && color && size) {
        existedCart.product.quantity += product.quantity;
        await existedCart.save();
      } else {
        await cartModel.create({ userId: user._id, product: cart });
      }
      return res.status(200).json({ message: 'Created Successfully!' });
    }
    return res.status(404).json({ message: 'Not found!' });
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
    const updatedProduct = await cartModel.findByIdAndUpdate(id, product);
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
