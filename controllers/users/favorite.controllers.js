import favoriteModel from '../../models/favorite.model.js';
export const getFavoritesByProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await favoriteModel.count({ products: id });
    return res
      .status(200)
      .json({ error: false, success: true, totalLiked: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getAllFavorites = async (req, res) => {
  const { user } = req.decoded;
  try {
    const total = await favoriteModel.countDocuments({ userId: user.id });
    const getFavorites = await favoriteModel
      .findOne({ userId: user.id })
      .populate({
        path: 'products',
        select: 'images name _id',
      });
    return res.status(200).json({
      error: false,
      success: true,
      favorite: getFavorites,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const postFavorites = async (req, res) => {
  const { user } = req.decoded;
  const { productId } = req.body;
  try {
    const existedFavorites = await favoriteModel.findOne({ userId: user.id });
    if (!existedFavorites) {
      await favoriteModel.create({
        userId: user.id,
        products: [productId],
      });
    } else {
      const existingProducts = existedFavorites.products;

      if (existingProducts.includes(productId)) {
        await favoriteModel.updateOne(
          { userId: user.id },
          { $pull: { products: productId } }
        );
      } else {
        await favoriteModel.updateOne(
          { userId: user.id },
          { $push: { products: productId } }
        );
      }
    }
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Update favorites successfully!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
