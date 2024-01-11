import bannerModel from '../../models/product/banner.model.js';
// Get All Banners

export const getAllBanners = async (req, res) => {
  try {
    const findAllBanners = await bannerModel.find().lean();
    if (findAllBanners) {
      return res.status(200).json(findAllBanners);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Create Banner

export const createBanner = async (req, res) => {
  const banner = req.body;
  try {
    const countBanner = await bannerModel.countDocuments();
    if (countBanner > 3) {
      return res
        .status(411)
        .json({ message: 'Can not add more than 3 recordings!' });
    }
    const existingBanner = await bannerModel
      .findOne({
        content: banner.content,
      })
      .lean();
    if (existingBanner) {
      return res.status(409).json({
        message: `Banner content ${banner.content} already existed!`,
      });
    } else {
      const newBanner = new bannerModel(banner);
      const savedBanner = await newBanner.save();
      return res.status(200).json(savedBanner);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Banner

export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const banner = req.body;
  try {
    const existingBanner = await bannerModel.findById(id);
    if (existingBanner) {
      return res.status(404).json({ message: `Not found Banner by id: ${id}` });
    } else {
      const updatedBanner = await bannerModel.findByIdAndUpdate({
        _id: id,
        banner,
      });
      return res.status(200).json(updatedBanner);
    }
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
