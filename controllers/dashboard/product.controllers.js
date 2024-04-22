import unidecode from 'unidecode';
import productModel from '../../models/product.model.js';
import categoryModel from '../../models/category.model.js';
import tagModel from '../../models/tag.model.js';
import { deleteCache, updateCache } from '../../modules/cache.js';
import { optimizedImg } from '../../middleware/optimizedImg.js';
import adminModel from '../../models/admin.model.js';
import { redisClient } from '../../config/redis.js';
// Get all products
export const dashboard_getAllProducts = async (req, res) => {
  const admin = req.decoded;
  const { category, tag, sort, search, page } = req.query;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
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
      case 'published':
        sortQuery = { published: -1 };
        break;
      case 'unpublished':
        sortQuery = { published: 1 };
        break;
      default:
        break;
    }
    if (search != 'null' && search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.$text = { $search: regex };
    }
    const totalProducts = await productModel.countDocuments(query);
    const total = Math.ceil(totalProducts / 8);
    const findAllProducts = await productModel
      .find(query)
      .sort(sortQuery)
      .populate(['details.category', 'details.tags'])
      .populate('coupon')
      .skip((page - 1) * 8)
      .limit(8)
      .lean();
    return res.status(200).json({
      error: false,
      success: true,
      products: findAllProducts ? findAllProducts : [],
      totalPage: total,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get product by id
export const dashboard_getProductById = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const product = await productModel
      .findById(id)
      .populate(['details.category', 'details.tags'])
      .populate('coupon');
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
    if (!product) {
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
export const createProduct = async (req, res) => {
  const admin = req.decoded;
  const {
    name,
    description,
    shortDescription,
    weight,
    dimensions,
    materials,
    price,
    category,
    tags,
    variants,
  } = req.body;
  const files = req.files;
  const product = {
    name: name,
    images: [],
    price: Number(price),
    finalPrice: Number(price),
    details: {
      variants: JSON.parse(variants),
      description: description,
      shortDescription: shortDescription,
      weight: weight,
      dimensions: dimensions,
      materials: materials,
      tags: [...JSON.parse(tags)],
      category: category,
    },
  };
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (
      !name ||
      !description ||
      !shortDescription ||
      !weight ||
      !dimensions ||
      !materials ||
      !price ||
      !category ||
      tags.length === 0 ||
      variants.length === 0 ||
      !files
    )
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad requests!' });
    const duplicatedProduct = await productModel.findOne({
      name: name.toLowerCase(),
    });
    if (duplicatedProduct)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'This product already existed!',
      });
    product.details.variants = product.details.variants.map((v) => {
      return {
        color: v.color,
        size: v.size,
        quantity: Number(v.quantity),
        availableQuantity: Number(v.quantity),
      };
    });
    const images = files.map(async (file) => {
      return file.path;
    });
    const imageUrls = await Promise.all(images);
    product.images.push(...imageUrls);
    const newProduct = new productModel(product);
    const savedProduct = await newProduct.save();

    if (savedProduct) {
      await deleteCache('products_all*');
      await redisClient.set(
        `products:${savedProduct._id}`,
        JSON.stringify(savedProduct)
      );
      return res.status(201).json({
        error: false,
        success: true,
        message: 'Created successfully!',
      });
    }
    return res
      .status(503)
      .json({ error: true, success: false, message: 'Service Unavailable!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Update Product

export const updateProduct = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const product = req.body;
  const files = req.files;
  const oldImages = JSON.parse(product.old_images);
  let updatedImages;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (
      !product.name ||
      !product.description ||
      !product.shortDescription ||
      !product.weight ||
      !product.dimensions ||
      !product.materials ||
      !product.price ||
      !product.category ||
      product.tags.length === 0 ||
      product.variants.length === 0
    )
      return res.status(400).json({ message: 'Bad requests!' });
    if (files) {
      const listImg = files
        .filter((file) => !oldImages.includes(file.path))
        .map(async (file) => {
          return file.path;
        });
      updatedImages = await Promise.all(listImg);
    }
    const variants = JSON.parse(product.variants).map((v) => {
      return { color: v.color, size: v.size, quantity: Number(v.quantity) };
    });
    const update = {
      name: product.name,
      images: [...updatedImages, ...oldImages],
      price: Number(product.price),
      finalPrice: Number(product.price),
      details: {
        variants: variants,
        description: product.description,
        shortDescription: product.shortDescription,
        weight: product.weight,
        dimensions: product.dimensions,
        materials: product.materials,
        tags: [...JSON.parse(product.tags)],
        category: product.category,
      },
      updated_at: new Date(),
    };
    const updatedProduct = await productModel.findByIdAndUpdate(id, update);

    if (updatedProduct) {
      await updateCache(`products:${updatedProduct._id}`, updatedProduct);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated product successfully!',
        updatedProduct,
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: `Not found product id object: ${id}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteProduct = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (deletedProduct) {
      await deleteCache(`products:${deletedProduct._id}*`);
      await deleteCache(`products_all*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted product successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const publishedProduct = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { published } = req.body;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const updatedProduct = await productModel.findByIdAndUpdate(id, {
      published: published,
    });
    if (updatedProduct.published === false) {
      await deleteCache(`products:${updatedProduct._id}`);
      await deleteCache(`products_all*`);
    }
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Product updated successfully',
      updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getReviews = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { page } = req.query;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
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
      error: false,
      success: true,
      reviews: reviews,
      avgRate: averageRating,
      total: total,
      totalPage: countPage,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
