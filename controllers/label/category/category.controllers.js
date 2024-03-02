import {
  firstLoadingCache,
  deleteCache,
  updateCache,
} from '../../../modules/cache.js';
import categoryModel from '../../../models/category/category.model.js';
import { redisClient } from '../../../config/redis.js';
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
  const category = req.body;
  try {
    const existingCategory = await categoryModel
      .findOne({
        name: category.name,
      })
      .lean();
    if (existingCategory) {
      return res.status(409).json({
        message: `Category name ${category.name} already existed!`,
      });
    } else {
      const newCategory = new categoryModel(category);
      const savedCategory = await newCategory.save();
      redisClient.setEx(`categories:${savedCategory._id}`);
      return res.status(200).json(savedCategory);
    }
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
      await deleteCache(`categories:${id}`, deletedCategory);
      return res.status(200).json(deletedCategory);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
