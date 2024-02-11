import unidecode from 'unidecode';
import productModel from '../../models/product/product.model.js';
import categoryModel from '../../models/category/category.model.js';
import tagModel from '../../models/tag/tag.model.js';
import orderModel from '../../models/product/order.model.js';
import {
  calculateFinalPrice,
  calculateFinalPricesForProducts,
} from '../../utils/productHelper.js';
import reviewsModel from '../../models/product/reviews.model.js';
import { hidePartialUsername } from '../../utils/validate.js';
import { totalPage } from '../../utils/totalPage.js';
import { client } from '../../config/redis.js';
// Get all products
export const getAllProducts = async (req, res) => {
  const { category, tag, sort, search, page } = req.query;
  try {
    let query = {};
    let sortQuery = {};
    const foundCategory = category
      ? await categoryModel.findOne({ name: category })
      : '';
    const foundTag = tag ? await tagModel.findOne({ name: tag }) : '';
    if (foundCategory !== '' || foundTag !== '') {
      if (foundCategory !== '') {
        query['details.category'] = foundCategory?._id;
      }
      if (foundTag !== '') {
        query['details.tags'] = foundTag?._id;
      }
      if (foundCategory && foundTag) {
        query = {
          'details.category': foundCategory?._id,
          'details.tags': foundTag?._id,
        };
      }
    }

    switch (sort) {
      case '-date':
        sortQuery = {
          created_at: 1,
        };
        break;
      case 'date':
        sortQuery = {
          created_at: -1,
        };
        break;
      case '-price':
        sortQuery = { price: 1 };
        break;
      case 'price':
        sortQuery = { price: -1 };
        break;
      default:
        break;
    }
    const totalProducts = await productModel.countDocuments(query);
    const total = Math.ceil(totalProducts / 8);
    const findAllProducts = await productModel
      .find(query)
      .sort(sortQuery)
      .populate(['details.category', 'details.tags'])
      .populate('sale')
      .skip((page - 1) * 8)
      .limit(8)
      .lean();
    if (findAllProducts) {
      return res.status(200).json({
        products: findAllProducts,
        totalPage: total,
        currentPage: page,
      });
    }
    return res.status(404).json({ messages: 'Not found products in database' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get product by id

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const existingProduct = await productModel
      .findById(id)
      .populate(['details.category', 'details.tags']);
    const relatedProducts = await productModel
      .find({
        'details.tags': { $in: [...existingProduct.details.tags] },
        'details.category': existingProduct.details.category,
        _id: { $ne: existingProduct._id },
      })
      .sort({ created_at: -1 })
      .populate(['details.category', 'details.tags'])
      .populate('sale')
      .lean()
      .limit(8);
    // const calculateProduct = await calculateFinalPrice(existingProduct);
    // const calculateProducts = await calculateFinalPricesForProducts(
    //   relatedProducts
    // );
    await Promise.all([existingProduct, relatedProducts]).then(() => {
      if (!existingProduct) {
        return res.status(404).json({ message: `Not found by id ${id}` });
      } else {
        return res.status(200).json({
          product: existingProduct,
          relatedProducts: relatedProducts,
        });
      }
    });
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
      .populate('sale')
      .limit(products)
      .lean();
    // const calculateFinalPricesForProducts =
    //   await calculateFinalPricesForProducts(searchProducts);
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

// Create Product

export const createProduct = async (req, res) => {
  const product = req.body;
  try {
    if (!product.details || !product.details.variants)
      return res.status(400).json({ message: 'Variants not null!' });
    const existingProduct = await productModel
      .findOne({ name: product.name })
      .lean();
    if (existingProduct) {
      const { variants } = product.details;
      variants.forEach((variant) => {
        const existingVariant = existingProduct.details.variants.find(
          (v) =>
            v.size === variant.size?.toLowerCase() &&
            v.color === variant.color?.toLowerCase()
        );
        if (existingVariant) {
          existingVariant.inStock = variant.quantity > 0 ? true : false;
          existingVariant.quantity += variant.quantity;
        } else {
          variant.inStock = variant.quantity > 0 ? true : false;
          existingProduct.details.variants.push(variant);
        }
      });
      const updatedProduct = await existingProduct.save().lean();
      return res.status(200).json({ product: updatedProduct });
    } else {
      const { variants } = product.details;
      variants.forEach((variant) => {
        variant.inStock = variant.quantity > 0 ? true : false;
      });
      const newProduct = new productModel(product);
      const savedProduct = await newProduct.save().lean();
      return res.status(200).json({ product: savedProduct });
    }
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
// Get Reviews

export const getReviews = async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;

  try {
    const total = await reviewsModel.countDocuments({ productId: id });
    const countPage = totalPage(total, 10);
    const avgRate = await reviewsModel.aggregate([
      {
        $match: { productId: id },
      },
      {
        $group: {
          _id: `productId`,
          avgRate: { $avg: '$rate' },
        },
      },
    ]);
    const averageRating = Math.ceil(avgRate[0].avgRate * 10) / 10;
    const getReviews = await reviewsModel
      .find({ productId: id })
      .sort({ created_at: -1 })
      .skip((page - 1) * 10)
      .limit(10);
    const reviews = getReviews || [];
    return res.status(200).json({
      reviews: reviews,
      avgRate: averageRating,
      total: total,
      totalPage: countPage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
// Reviews Product
export const reviewsProduct = async (req, res) => {
  const { user } = req.decoded;
  const { rate, reviews, showUser, productId, orderId } = req.body;
  try {
    const newReviews = new reviewsModel({
      productId: productId,
      rate: rate,
      reviews: reviews,
      avatar: showUser
        ? user.image
        : 'http://localhost:3000/public/avatar-trang.jpg',
      showUser: showUser,
      username: showUser ? hidePartialUsername(user.email) : user.email,
    });
    await newReviews.save();
    const updateOrders = await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        'paymentInfo.products.id': productId,
      },
      {
        $set: {
          'paymentInfo.products.$.isReview': true,
        },
      },
      { new: true }
    );
    if (updateOrders) {
      return res.status(200).json({ message: 'Reviews Successfully!' });
    }
    return res.send('Something went error!');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
