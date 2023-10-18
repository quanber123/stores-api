import { Router } from 'express';
import productModel from '../models/product.model';
const router = Router();
// Get all products
export const getAllProducts = async (req, res) => {
  const { products, page } = req.query;
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
      res.status(404).json({ messages: 'Not found products in database' });
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
