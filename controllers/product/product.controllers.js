import unidecode from 'unidecode';
import productModel from '../../models/product/product.model.js';
import categoryModel from '../../models/category/category.model.js';
import tagModel from '../../models/tag/tag.model.js';
import orderModel from '../../models/order/order.model.js';
import reviewsModel from '../../models/product/reviews.model.js';
import { hidePartialUsername } from '../../utils/validate.js';
import { totalPage } from '../../utils/totalPage.js';
import { esClient } from '../../config/elasticsearch.js';
import { checkCache } from '../../modules/cache.js';
import { redisClient } from '../../config/redis.js';
import { docWithoutId } from '../../modules/elasticsearch.js';
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
    if (search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.name = { $regex: regex };
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
    return res.status(200).json({
      products: findAllProducts ? findAllProducts : [],
      totalPage: total ? total : 0,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
// export const getAllProducts = async (req, res) => {
//   const { category, tag, sort, search, page } = req.query;
//   let queryAll = {
//     match_all: {},
//   };
//   let mQuery = {
//     bool: {
//       must: [],
//     },
//   };
//   let sortQuery = [{ created_at: 'desc' }];
//   let totalPage = 0;

//   try {
//     if (search) {
//       mQuery.bool.must.push({ match: { name: search } });
//     }
//     let nestedConditions = [];
//     if (tag) {
//       nestedConditions.push({ match: { 'details.tags.name': tag } });
//     }
//     if (category) {
//       nestedConditions.push({ match: { 'details.category.name': category } });
//     }

//     if (nestedConditions.length > 0) {
//       mQuery.bool.must.push({
//         nested: {
//           path: 'details',
//           query: {
//             bool: {
//               must: nestedConditions,
//             },
//           },
//         },
//       });
//     }
//     switch (sort) {
//       case '-date':
//         sortQuery = [{ created_at: 'asc' }];
//         break;
//       case 'date':
//         sortQuery = [{ created_at: 'desc' }];
//         break;
//       case '-price':
//         sortQuery = [{ price: 'asc' }];
//         break;
//       case 'price':
//         sortQuery = [{ price: 'desc' }];
//         break;
//       default:
//         break;
//     }

//     const finalQuery =
//       mQuery.bool.must[0]?.nested?.query?.bool?.must.length > 0 ||
//       search?.length > 0
//         ? mQuery
//         : queryAll;
//     const data = await esClient.search({
//       index: 'products',
//       body: {
//         sort: sortQuery,
//         query: finalQuery,
//         from: ((page || 1) - 1) * 8,
//         size: 8,
//         _source: true,
//         track_total_hits: true,
//       },
//     });

//     const totalProducts = data.hits.total.value;
//     totalPage = Math.ceil(totalProducts / 8);

//     return res.status(200).json({
//       products: data.hits.hits.flatMap((h) => [{ ...h._source, _id: h._id }]),
//       totalPage: totalPage,
//       currentPage: page,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// Get product by id
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await checkCache(`products:${id}`, async () => {
      const product = await productModel
        .findById(id)
        .populate(['details.category', 'details.tags']);
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
      .populate('sale')
      .lean()
      .limit(8);

    if (!data) {
      return res.status(404).json({ message: `Not found by id ${id}` });
    } else {
      return res.status(200).json({
        product: data,
        relatedProducts: relatedProducts,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// export const getProductById = async (req, res) => {
//     const { id } = req.params;
//     try {
//       const product = await checkCache(`products:${id}`, async () => {
//         const data = await esClient.get({
//           index: 'products',
//           id: id,
//         });
//         await redisClient.set(
//           `products:${id}`,
//           JSON.stringify({ _id: data._id, ...data._source })
//         );
//         return { _id: data._id, ...data._source };
//       });
//       const relatedProducts = await esClient.search({
//         index: 'products',
//         body: {
//           sort: [{ created_at: 'desc' }],
//           query: {
//             bool: {
//               must: [
//                 {
//                   nested: {
//                     path: 'details',
//                     query: {
//                       bool: {
//                         must: [
//                           {
//                             match: {
//                               'details.category.name':
//                                 product.details.category.name,
//                             },
//                           },
//                           {
//                             bool: {
//                               should: [
//                                 {
//                                   terms: {
//                                     'details.tags.name':
//                                       product.details.tags.map((t) => t.name),
//                                   },
//                                 },
//                               ],
//                             },
//                           },
//                         ],
//                       },
//                     },
//                   },
//                 },
//                 {
//                   bool: {
//                     must_not: [
//                       {
//                         term: { _id: id },
//                       },
//                     ],
//                   },
//                 },
//               ],
//             },
//           },
//           size: 10,
//         },
//       });
//       // console.log(relatedProducts);
//       if (!product) {
//         return res.status(404).json({ message: `Not found by id ${id}` });
//       } else {
//         return res.status(200).json({
//           product: product,
//           relatedProducts: relatedProducts.hits.hits.flatMap((h) => [
//             { ...h._source, _id: h._id },
//           ]),
//         });
//       }
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
// };
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
      await esClient.update({
        index: 'products',
        id: updatedProduct._id,
        doc: docWithoutId(updatedProduct),
      });
      return res.status(200).json({ product: updatedProduct });
    } else {
      const { variants } = product.details;
      variants.forEach((variant) => {
        variant.inStock = variant.quantity > 0 ? true : false;
      });
      const newProduct = new productModel(product);
      const savedProduct = await (await newProduct.save())
        .populate(['details.category', 'details.tags', 'sale'])
        .lean();
      await esClient.index({
        index: 'products',
        id: savedProduct._id,
        document: docWithoutId(savedProduct),
      });
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
    const currProduct = await productModel
      .updateOne({ _id: id }, product)
      .populate(['details.category', 'details.tags', 'sale']);
    if (!currProduct)
      return res.stats(404).json({ message: 'Not found Product!' });
    await esClient.update({
      index: 'products',
      id: currProduct._id,
      doc: docWithoutId(currProduct),
    });
    await redisClient.set(
      `products:${currProduct._id}`,
      JSON.stringify(currProduct)
    );
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
    const findProduct = await productModel
      .updateOne(
        { _id: id },
        { $pull: { 'details.variants': { size, color, quantity } } }
      )
      .populate(['details.category', 'details.tags', 'sale']);
    await esClient.update({
      index: 'products',
      id: findProduct._id,
      doc: docWithoutId(findProduct),
    });
    await redisClient.del(`products:${findProduct._id}`);
    if (!findProduct) {
      await esClient.delete({
        index: 'products',
        id: id,
      });
      return res.status(404).json({ message: `Not found product by id ${id}` });
    }
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
    const averageRating = Math.ceil(avgRate[0]?.avgRate * 10) / 10;
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
