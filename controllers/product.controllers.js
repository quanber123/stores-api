import productModel from '../models/product.model.js';
// Get all products
export const getAllProducts = async (req, res) => {
  const { products, page } = req.query;
  console.log(products, page);
  try {
    const totalProducts = await productModel.countDocuments();
    const total = Math.ceil(totalProducts / products);
    const findAllProducts = await productModel
      .find()
      .skip((page - 1) * products)
      .limit(products);
    if (findAllProducts) {
      return res
        .status(200)
        .json({ products: findAllProducts, totalPage: total });
    } else {
      return res
        .status(404)
        .json({ messages: 'Not found products in database' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Search products

export const searchProducts = async (req, res) => {
  const { searchValue, products, page } = req.query;
  try {
    if (!searchValue || !products || !page) {
      return res.status(400).json({ message: 'Missing search parameters' });
    }
    const searchRegex = new RegExp(searchValue, 'i');
    const totalProducts = await productModel.countDocuments({
      name: { $regex: searchRegex },
    });

    const total = Math.ceil(totalProducts / products);

    const searchProducts = await productModel
      .find({
        name: { $regex: searchRegex },
      })
      .skip((page - 1) * products)
      .limit(products);

    if (!searchProducts) {
      return res
        .status(404)
        .json({ message: `Not found results for ${searchValue}` });
    } else {
      return res.status(200).json({
        products: searchProducts,
        totalPage: total,
        countProducts: searchProducts.length,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Filter by Field

export const filteredByField = async (req, res) => {
  const { field, value, products, page } = req.query;
  const query = {};
  if (field && value) query[field] = value;
  try {
    const totalPages = await productModel.countDocuments(query);
    const total = Math.ceil(totalPages / products);
    const findAllProducts = await productModel
      .find(query)
      .skip((page - 1) * products)
      .limit(products);
    if (findAllProducts) {
      return res
        .status(200)
        .json({ products: findAllProducts, totalPages: total });
    } else {
      return res
        .status(404)
        .json({ message: 'Not found products in database' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Product

export const createProduct = async (req, res) => {
  const product = req.body;
  try {
    if (!product.details.variants)
      return res.status(400).json({ message: 'Variants not null!' });
    const newProduct = new productModel(product);
    const savedProduct = await newProduct.save();
    return res.status(200).json({ product: savedProduct });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Product

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  const product = req.body;
  try {
    const currProduct = await productModel.updateOne({ _id: id }, product);
    if (!currProduct)
      return res.stats(404).json({ message: 'Not found Product!' });
    return res
      .status(200)
      .json({ message: `Updated Successfully Product ${product}` });
  } catch (error) {
    return res.stats(500).json({ message: error.message });
  }
};

// Delete Product

export const deleteProduct = async (req, res) => {
  const id = req.params.id;
  const size = req.params.size;
  const color = req.params.color;
  const quantity = req.params.quantity;
  if (!id || !size || !color || !quantity)
    return res.status(400).json({ message: 'All Params are required!' });
  try {
    const findProduct = await productModel.updateOne(
      { _id: id },
      { $pull: { 'details.variants': { size, color, quantity } } }
    );
    if (!findProduct)
      return res.status(404).json({ message: `Not found product by id ${id}` });
    return res.stats(200).json({ message: `Delete Successfully!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
