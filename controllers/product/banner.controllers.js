import { redisClient } from '../../config/redis.js';
import { optimizedImg } from '../../middleware/optimizedImg.js';
import bannerModel from '../../models/product/banner.model.js';
// Get All Banners

export const getAllBanners = async (req, res) => {
  try {
    const findAllBanners = await bannerModel.find().populate('category').lean();
    if (findAllBanners) {
      return res.status(200).json(findAllBanners);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Banner

export const createBanner = async (req, res) => {
  const { content, sub_content, category } = req.body;
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ message: 'No file uploaded!' });
    const countBanner = await bannerModel.countDocuments();
    if (countBanner > 3) {
      return res
        .status(411)
        .json({ message: 'Can not add more than 3 recordings!' });
    }
    const existingBanner = await bannerModel
      .findOne({
        content: content,
        category: category,
      })
      .lean();
    if (existingBanner)
      return res.status(409).json({
        message: `Banner content or category is already existed!`,
      });
    const banner = {
      id: String(Date.now()).slice(-6),
      image: null,
      imageLaptop: null,
      imageTablet: null,
      imageMobile: null,
      content: content,
      sub_content: sub_content,
      category: category,
    };
    const [
      optimizedImgDesktop,
      optimizedImgLaptop,
      optimizedImgTablet,
      optimizedImgMobile,
    ] = await Promise.all([
      optimizedImg(file, 1920, 950, 100),
      optimizedImg(file, 1200, 700, 100),
      optimizedImg(file, 600, 400, 100),
      optimizedImg(file, 400, 400, 100),
    ]);
    if (
      optimizedImgDesktop &&
      optimizedImgLaptop &&
      optimizedImgTablet &&
      optimizedImgMobile
    ) {
      banner.image = `${process.env.APP_URL}/${optimizedImgDesktop}`;
      banner.imageLaptop = `${process.env.APP_URL}/${optimizedImgLaptop}`;
      banner.imageTablet = `${process.env.APP_URL}/${optimizedImgTablet}`;
      banner.imageMobile = `${process.env.APP_URL}/${optimizedImgMobile}`;
    } else {
      banner.image = `${process.env.APP_URL}/${file.path}`;
      banner.imageLaptop = `${process.env.APP_URL}/${file.path}`;
      banner.imageTablet = `${process.env.APP_URL}/${file.path}`;
      banner.imageMobile = `${process.env.APP_URL}/${file.path}`;
    }
    const newBanner = new bannerModel(banner);
    const savedBanner = await newBanner.save();
    if (savedBanner) {
      await redisClient.set(
        `banners:${savedBanner.id}`,
        JSON.stringify(savedBanner)
      );
    }
    return res
      .status(201)
      .json({ message: 'banner created successfully', savedBanner });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Banner

export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { content, sub_content, category } = req.body;
  const file = req.file;
  let listImages = {
    image: null,
    imageLaptop: null,
    imageTablet: null,
    imageMobile: null,
  };
  try {
    if (file) {
      const [
        optimizedImgDesktop,
        optimizedImgLaptop,
        optimizedImgTablet,
        optimizedImgMobile,
      ] = await Promise.all([
        optimizedImg(file, 1920, 950, 100),
        optimizedImg(file, 1200, 700, 100),
        optimizedImg(file, 600, 400, 100),
        optimizedImg(file, 400, 400, 100),
      ]);
      if (
        optimizedImgDesktop &&
        optimizedImgLaptop &&
        optimizedImgTablet &&
        optimizedImgMobile
      ) {
        listImages.image = `${process.env.APP_URL}/${optimizedImgDesktop}`;
        listImages.imageLaptop = `${process.env.APP_URL}/${optimizedImgLaptop}`;
        listImages.imageTablet = `${process.env.APP_URL}/${optimizedImgTablet}`;
        listImages.imageMobile = `${process.env.APP_URL}/${optimizedImgMobile}`;
      }
      const updated = await bannerModel.findByIdAndUpdate(id, {
        content: content,
        sub_content: sub_content,
        category: category,
        image: listImages.image,
        imageLaptop: listImages.imageLaptop,
        imageTablet: listImages.imageTablet,
        imageMobile: listImages.imageMobile,
      });

      if (updated)
        return res.status(200).json({ message: 'Updated successfully!' });
    } else {
      const updated = await bannerModel.findByIdAndUpdate(id, {
        content: content,
        sub_content: sub_content,
        category: category,
      });
      if (updated)
        return res.status(200).json({ message: 'Updated successfully!' });
    }
    return res.status(404).json({ message: `Not found banner ${id}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Banner

export const deleteBanner = async (req, res) => {
  const { id } = req.params;
  try {
    const existingBanner = await bannerModel.findById(id);
    if (existingBanner) {
      return res.status(404).json({ message: `Not found Banner by id: ${id}` });
    } else {
      const deletedBanner = await bannerModel.findByIdAndDelete(id);
      return res.status(200).json(deletedBanner);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
