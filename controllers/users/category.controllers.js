import { firstLoadingCache } from '../../modules/cache.js';
import categoryModel from '../../models/category.model.js';
// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const cachedCategories = await firstLoadingCache(
      'categories:*',
      categoryModel,
      null
    );
    if (cachedCategories !== null) {
      return res
        .status(200)
        .json({ error: false, success: true, categories: cachedCategories });
    } else {
      const categories = await categoryModel.find().lean();
      return res.status(200).json({
        error: false,
        success: true,
        categories: categories !== null ? categories : [],
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
