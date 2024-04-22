import { redisClient } from '../../config/redis.js';
import tagModel from '../../models/tag.model.js';
import { deleteCache, updateCache } from '../../modules/cache.js';
import productModel from '../../models/product.model.js';
import { productDeletionQueue } from '../../config/queue.js';
import adminModel from '../../models/admin.model.js';

// Get All Tags

export const getAllTags = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const tags = await tagModel.find().lean();
    return res
      .status(200)
      .json({ error: false, success: true, tags: tags !== null ? tags : [] });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create Tag

export const createTag = async (req, res) => {
  const tag = req.body;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const existingTag = await tagModel.findOne({
      name: tag.name,
    });
    if (existingTag) {
      return res.status(409).json({
        message: `Tag name ${tag} already existed!`,
      });
    } else {
      const newTag = new tagModel(tag);
      const savedTag = await newTag.save();
      await redisClient.set(`tags:${savedTag._id}`, JSON.stringify(savedTag));
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Created tag successfully!',
        tags: savedTag,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Tag

export const updateTag = async (req, res) => {
  const { id } = req.params;
  const tag = req.body;
  const admin = req.decoded;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const updatedTag = await tagModel.findByIdAndUpdate(id, tag);

    if (!updatedTag) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found Tag by id: ${id}`,
      });
    } else {
      await updateCache(`tags:${updatedTag._id}`, updatedTag);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated tag successfully!',
        tag: updatedTag,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete Tag
export const deleteTag = async (req, res) => {
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
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const deletedTag = await tagModel.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found Tag by id: ${id}`,
      });
    } else {
      const updatedProducts = await productModel.find({
        'details.tags': deletedTag._id,
      });
      updatedProducts.forEach((product) => {
        productDeletionQueue.add(
          {
            productId: product._id,
          },
          async () => {
            const updatedTags = product.details.tags.filter(
              (tagId) => !tagId.equals(deletedTag._id)
            );
            await productModel.findByIdAndUpdate(product._id, {
              'details.tags': updatedTags,
            });
          }
        );
      });
      await deleteCache(`tags:${id}`);
      await deleteCache(`products_all*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted tag successfully!',
        tag: deletedTag,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
