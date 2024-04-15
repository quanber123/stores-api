import bannerModel from '../../models/banner.model.js';
import { firstLoadingCache } from '../../modules/cache.js';
// Get All Banners

export const getAllBanners = async (req, res) => {
  try {
    const cachedBanners = await firstLoadingCache('banners:*', bannerModel, [
      'category',
    ]);
    if (cachedBanners !== null) {
      return res.status(200).json(cachedBanners);
    } else {
      const banners = await bannerModel.find().populate('category').lean();
      return res.status(200).json(banners !== null ? banners : []);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
