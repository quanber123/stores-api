import saleModel from '../../models/product/sale.model.js';
import productModel from '../../models/product/product.model.js';

export const getAllSales = async (req, res) => {
  try {
    const getAllSales = await saleModel.find().populate('tag').lean();
    if (getAllSales) return res.status(200).json(getAllSales);
    return res
      .status(404)
      .json({ message: 'There are currently no discount codes available!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateProductsForSale = async (sale) => {
  try {
    const updatedProducts = await productModel
      .find({
        'details.tags': { $in: sale.tag },
      })
      .lean();
    const updatePromises = updatedProducts.map(async (product) => {
      const salePrice = product.price - (product.price * sale.rate) / 100;
      product.sale = sale._id;
      product.salePrice = salePrice;
      product.finalPrice = salePrice;
      return productModel.findByIdAndUpdate(product._id, product);
    });
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating products for sale:', error);
  }
};
export const createSale = async (req, res) => {
  const { name, rate, tag, active, endDate } = req.body;
  try {
    const duplicateSale = await saleModel.findOne({ name: name });
    if (duplicateSale)
      return res.status(409).json({ message: 'This sale already existed!' });
    const newSale = new saleModel({ name, rate, tag, active, endDate });
    const createdSale = await newSale.save();
    if (createdSale.active) {
      await updateProductsForSale(createdSale);
    }
    res.status(201).json({ message: 'Sale created successfully', createdSale });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSale = async (req, res) => {
  const { id } = req.body;
  try {
    const deleteSale = await saleModel.findByIdAndDelete(id);
    if (deleteSale)
      return res.status(200).json({ message: 'Deleted successfully!' });
    return res.status(404).json({ message: `Not found sale!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
