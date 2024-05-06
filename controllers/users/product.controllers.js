import unidecode from 'unidecode';
import productModel from '../../models/product.model.js';
import categoryModel from '../../models/category.model.js';
import tagModel from '../../models/tag.model.js';
import orderModel from '../../models/order.model.js';
import reviewsModel from '../../models/reviews.model.js';
import { hidePartialUsername } from '../../utils/validate.js';
import { totalPage } from '../../utils/totalPage.js';
import { checkCache, deleteCache } from '../../modules/cache.js';
import { redisClient } from '../../config/redis.js';
import mongoose from 'mongoose';

// Get all products
export const getAllProducts = async (req, res) => {
  const { category, tag, sort, search, page } = req.query;
  try {
    let query = {};
    let sortQuery = {};
    const foundCategory = category
      ? await categoryModel.findOne({ name: category })
      : null;
    const foundTag = tag ? await tagModel.findOne({ name: tag }) : null;
    if (foundCategory || foundTag) {
      if (foundCategory) {
        query['details.category'] = foundCategory?._id;
      }
      if (foundTag) {
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
    if (search != 'null' && search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.name = regex;
    }
    const keyValuePairs = Object.entries(req.query).map(
      ([key, value]) => `${key}:${value.replace(/\s+/g, '')}`
    );
    const resultString = keyValuePairs.join('_') || 'page:1';
    const productsData = await checkCache(
      `products_all_${resultString}`,
      async () => {
        const totalProducts = await productModel.countDocuments({
          ...query,
          published: true,
        });
        const total = Math.ceil(totalProducts / 8);
        const findAllProducts = await productModel
          .find({ ...query, published: true })
          .sort(sortQuery)
          .populate(['details.category', 'details.tags'])
          .populate('coupon')
          .skip((page - 1) * 8)
          .limit(8)
          .lean();
        return {
          products: findAllProducts ? findAllProducts : [],
          totalPage: total,
        };
      },
      60 * 60 * 24
    );
    return res.status(200).json({
      error: false,
      success: true,
      products: productsData.products,
      totalPage: productsData.totalPage,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get product by id
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await checkCache(`products:${id}`, async () => {
      const product = await productModel
        .findById(id)
        .populate(['details.category', 'details.tags'])
        .populate('coupon');
      await redisClient.set(`products:${product._id}`, JSON.stringify(product));
      return product;
    });
    const relatedProducts = await productModel
      .find({
        'details.tags': { $in: [...data.details.tags] },
        'details.category': data.details.category,
        _id: { $ne: data._id },
      })
      .sort({ created_at: -1 })
      .populate(['details.category', 'details.tags'])
      .populate('coupon')
      .lean()
      .limit(8);
    if (!data) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found by id ${id}`,
      });
    } else {
      return res.status(200).json({
        error: false,
        success: true,
        product: data,
        relatedProducts: relatedProducts,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Get Reviews

export const getReviews = async (req, res) => {
  const { id } = req.params;
  const { page } = req.query;

  try {
    const reviewsData = await checkCache(`products:${id}_reviews`, async () => {
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
      const averageRating = Math.ceil(avgRate[0]?.avgRate * 10) / 10;
      const getReviews = await reviewsModel
        .find({ productId: id })
        .sort({ created_at: -1 })
        .skip((page - 1) * 10)
        .limit(10);
      const reviews = getReviews || [];
      return {
        reviews: reviews,
        avgRate: averageRating,
        total: total,
        totalPage: countPage,
      };
    });
    return res.status(200).json({
      error: false,
      success: true,
      reviewsData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Reviews Product
export const reviewsProduct = async (req, res) => {
  const user = req.decoded;
  const { rate, reviews, showUser, productId, orderId } = req.body;
  try {
    const [createdReviews, updatedOrder] = await Promise.all([
      reviewsModel.create({
        productId: productId,
        rate: rate,
        reviews: reviews,
        avatar: showUser
          ? user.image
          : `${process.env.APP_URL}/public/avatar-trang.jpg`,
        showUser: showUser,
        username: showUser ? hidePartialUsername(user.email) : user.email,
      }),
      orderModel.findOneAndUpdate(
        {
          user: user.id,
          'paymentInfo.orderCode': orderId,
          'paymentInfo.products.id': productId,
        },
        {
          $set: {
            'paymentInfo.products.$.isReview': true,
          },
        },
        { new: true }
      ),
    ]);
    if (createdReviews && updatedOrder) {
      await deleteCache(`products:${productId}*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Reviews Successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
