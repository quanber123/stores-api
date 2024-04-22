import { redisClient } from '../../config/redis.js';
import bannerModel from '../../models/banner.model.js';
import adminModel from '../../models/admin.model.js';
import { deleteCache, updateCache } from '../../modules/cache.js';
export const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find().populate('category').lean();
    return res.status(200).json(banners !== null ? banners : []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Banner

export const createBanner = async (req, res) => {
  const admin = req.decoded;
  const { content, sub_content, category } = req.body;
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
    const countBanner = await bannerModel.countDocuments();
    if (countBanner > 3) {
      return res.status(411).json({
        error: true,
        success: false,
        message: 'Can not add more than 3 recordings!',
      });
    }
    const existingBanner = await bannerModel
      .findOne({
        content: content,
        category: category,
      })
      .lean();
    if (existingBanner)
      return res.status(409).json({
        error: true,
        success: false,
        message: `Banner content or category is already existed!`,
      });
    const banner = {
      id: String(Date.now()).slice(-6),
      image: file.path,
      content: content,
      sub_content: sub_content,
      category: category,
    };
    const newBanner = new bannerModel(banner);
    const savedBanner = await newBanner.save();
    if (savedBanner) {
      await redisClient.set(
        `banners:${savedBanner.id}`,
        JSON.stringify(savedBanner)
      );
    }
    return res.status(201).json({
      error: true,
      success: false,
      message: 'Created banner successfully!',
      savedBanner,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Banner

export const updateBanner = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { content, sub_content, category } = req.body;
  const file = req.file;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    if (file) {
      const updated = await bannerModel.findByIdAndUpdate(id, {
        content: content,
        sub_content: sub_content,
        category: category,
        image: file.path,
      });
      if (updated);
      return res.status(200).json({ message: 'Updated banner successfully!' });
    } else {
      const updated = await bannerModel.findByIdAndUpdate(id, {
        content: content,
        sub_content: sub_content,
        category: category,
      });

      if (updated) {
        await updateCache(`banners:${updated._id}`, updated);
        return res
          .status(200)
          .json({ message: 'Updated banner successfully!' });
      }
    }
    return res.status(404).json({ message: `Not found banner ${id}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Banner

export const deleteBanner = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const deletedBanner = await bannerModel.findByIdAndDelete(id);
    if (deletedBanner) {
      await deleteCache(`banners:${deletedBanner._id}`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted banner successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
