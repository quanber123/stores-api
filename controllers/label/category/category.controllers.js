import {
  firstLoadingCache,
  deleteCache,
  updateCache,
} from '../../../modules/cache.js';
import categoryModel from '../../../models/category/category.model.js';
import { redisClient } from '../../../config/redis.js';
import { optimizedImg } from '../../../middleware/optimizedImg.js';
import productModel from '../../../models/product/product.model.js';
// Get All Categories
export const getAllCategories = async (req, res) => {
  let categories;
  try {
    const cachedCategories = await firstLoadingCache(
      'categories:*',
      categoryModel,
      null
    );
    if (cachedCategories !== null) {
      return res.status(200).json(cachedCategories);
    } else {
      categories = await categoryModel.find().lean();
      return res.status(200).json(categories !== null ? categories : []);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Create Category

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ message: 'No file uploaded!' });
    const existingCategory = await categoryModel
      .findOne({
        name: name,
      })
      .lean();
    if (existingCategory)
      return res.status(409).json({
        message: `Category ${name} already existed!`,
      });
    const category = {
      id: String(Date.now()).slice(-6),
      image: null,
      name: name,
      description: description,
    };
    const optimized = await optimizedImg(file, 400, 300, 80);
    if (optimized) {
      category.image = `${process.env.APP_URL}/${optimized}`;
    } else {
      category.image = `${process.env.APP_URL}/${file.path}`;
    }
    const newCategory = new categoryModel(category);
    const savedCategory = await newCategory.save();
    if (savedCategory) {
      await redisClient.set(
        `categories:${savedCategory.id}`,
        JSON.stringify(savedCategory)
      );
    }
    return res.status(201).json({
      message: `category ${category.name} created successfully`,
      savedCategory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Category

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = req.body;
  try {
    const updatedCategory = await categoryModel.findByIdAndUpdate(id, category);
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ message: `Not found Category by id: ${id}` });
    } else {
      await updateCache(`categories:${id}`, updatedCategory);
      return res.status(200).json(updatedCategory);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Category

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ message: `Not found Category by id: ${id}` });
    } else {
      const deleteProducts = await productModel.deleteMany({
        'details.category': deletedCategory._id,
      });
      await Promise.all([
        deleteProducts.forEach(async (product) => {
          await deleteCache(`products:${product.id}`);
        }),
        await deleteCache(`categories:${id}`, deletedCategory),
      ]);
      return res.status(200).json(deletedCategory);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
