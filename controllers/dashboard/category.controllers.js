import categoryModel from '../../models/category.model.js';
import adminModel from '../../models/admin.model.js';
import { redisClient } from '../../config/redis.js';
import { updateCache } from '../../modules/cache.js';
// Get All Categories
export const getAllCategories = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const categories = await categoryModel.find().lean();
    return res.status(200).json({
      error: false,
      success: true,
      categories: categories !== null ? categories : [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Create Category

export const createCategory = async (req, res) => {
  const admin = req.decoded;
  const { name, description } = req.body;
  const file = req.file;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (!file)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'No file uploaded!' });
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
      image: file.path,
      name: name,
      description: description,
    };
    const newCategory = new categoryModel(category);
    const savedCategory = await newCategory.save();

    if (savedCategory) {
      await redisClient.set(
        `categories:${savedCategory._id}`,
        JSON.stringify(savedCategory)
      );
    }
    return res.status(201).json({
      error: true,
      success: false,
      message: `Created category ${category.name} successfully`,
      category: savedCategory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Category

export const updateCategory = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { name, description } = req.body;
  const file = req.file;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    if (file) {
      const updatedCategory = await categoryModel.findByIdAndUpdate(id, {
        name: name,
        description: description,
        image: file.path,
      });
      if (updatedCategory) {
        await updateCache(`categories:${updatedCategory._id}`, updatedCategory);
        return res
          .status(200)
          .json({ message: 'Updated category successfully!', updatedCategory });
      }
    }
    const updatedCategory = await categoryModel.findByIdAndUpdate(id, {
      name: name,
      description: description,
    });

    if (updatedCategory) {
      await updateCache(`categories:${updatedCategory._id}`, updatedCategory);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated category successfully!',
        updatedCategory,
      });
    }
    return res
      .status(404)
      .json({ error: true, success: false, message: `Not found Category` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res
        .status(404)
        .json({ message: `Not found Category by id: ${id}` });
    } else {
      await deleteCache(`categories:${deletedCategory._id}`, deletedCategory);
      const deleteProducts = await productModel.find({
        'details.category': deletedCategory._id,
      });
      deleteProducts.forEach((product) => {
        productDeletionQueue.add({
          productId: product._id,
        });
      });
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted category successfully!',
        category: deletedCategory,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
