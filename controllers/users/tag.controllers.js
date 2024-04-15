import tagModel from '../../models/tag.model.js';
import { firstLoadingCache } from '../../modules/cache.js';

// Get All Tags

export const getAllTags = async (req, res) => {
  try {
    const cachedTags = await firstLoadingCache('tags:*', tagModel, []);
    if (cachedTags !== null)
      return res
        .status(200)
        .json({ error: false, success: true, tags: cachedTags });
    const tags = await tagModel.find().lean();
    return res.status(200).json({
      error: false,
      success: true,
      tags: tags !== null ? tags : [],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
