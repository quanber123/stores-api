import categoryModel from '../../models/category/category.model.js';
// Get All Categories

export const getAllCategories = async (req, res) => {
  try {
    const findAllCategories = await categoryModel.find().lean();
    if (findAllCategories) {
      return res.status(200).json(findAllCategories);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
    const existingCategory = await categoryModel.findById(id).lean();
    if (existingCategory) {
      return res
        .status(404)
        .json({ message: `Not found Category by id: ${id}` });
    } else {
      const updatedCategory = await categoryModel
        .findByIdAndUpdate({
          _id: id,
          category,
        })
        .lean();
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
    const existingCategory = await categoryModel.findById(id).lean();
    if (existingCategory) {
      return res
        .status(404)
        .json({ message: `Not found Category by id: ${id}` });
    } else {
      const deletedCategory = await categoryModel.findByIdAndDelete(id).lean();
      return res.status(200).json(deletedCategory);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
