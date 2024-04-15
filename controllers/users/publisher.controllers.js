import publisherModel from '../../models/publisher.model.js';
import { firstLoadingCache } from '../../modules/cache.js';

// Get All Publishers

export const getAllPublishers = async (req, res) => {
  try {
    const cachedPublishers = await firstLoadingCache(
      'publishers:*',
      publisherModel,
      []
    );
    if (cachedPublishers !== null)
      return res
        .status(200)
        .json({ error: false, success: true, publishers: cachedPublishers });

    const findAllPublishers = await publisherModel.find().lean();
    return res.status(200).json({
      error: false,
      success: true,
      publishers: findAllPublishers !== null ? findAllPublishers : [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
