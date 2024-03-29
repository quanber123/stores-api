import { json } from 'express';
import { redisClient } from '../../../config/redis.js';
import tagModel from '../../../models/tag/tag.model.js';
import {
  deleteCache,
  firstLoadingCache,
  updateCache,
} from '../../../modules/cache.js';
import productModel from '../../../models/product/product.model.js';
import { productDeletionQueue } from '../../../config/queue.js';
import adminModel from '../../../models/auth/admin/admin.model.js';

// Get All Tags

export const getAllTags = async (req, res) => {
  let cachedTags;
  let tags;
  try {
    cachedTags = await firstLoadingCache('tags:*', tagModel, []);
    if (cachedTags !== null) {
      return res.status(200).json(cachedTags);
    } else {
      tags = await tagModel.find().lean();
      return res.status(200).json(tags !== null ? tags : []);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create Tag

export const createTag = async (req, res) => {
  const admin = req.decoded;
  const tag = req.body;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
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
      redisClient.set(`tags:${savedTag._id}`, JSON.stringify(savedTag));
      return res.status(200).json(savedTag);
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
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const updatedTag = await tagModel.findByIdAndUpdate(id, tag);
    if (!updatedTag) {
      return res.status(404).json({ message: `Not found Tag by id: ${id}` });
    } else {
      await updateCache(`tags:${updatedTag._id}`, updatedTag);
      return res.status(200).json(updatedTag);
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
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const deletedTag = await tagModel.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.status(404).json({ message: `Not found Tag by id: ${id}` });
    } else {
      const deleteProducts = await productModel.find({
        'details.tags': deletedTag._id,
      });
      deleteProducts.forEach((product) => {
        productDeletionQueue.add({
          productId: product._id,
        });
      });
      await deleteCache(`tags:${id}`, deletedTag);
      return res.status(200).json(deletedTag);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
