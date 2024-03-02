import { json } from 'express';
import { redisClient } from '../../../config/redis.js';
import tagModel from '../../../models/tag/tag.model.js';
import {
  deleteCache,
  firstLoadingCache,
  updateCache,
} from '../../../modules/cache.js';
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
  const tag = req.body;
  try {
    const existingTag = await tagModel.findOne({
      name: tag.name,
    });
    if (existingTag) {
      return res.status(409).json({
        message: `Tag name ${tag.name} already existed!`,
      });
    } else {
      const newTag = new tagModel(tag);
      const savedTag = await newTag.save();
      redisClient.setEx(`tags:${savedTag._id}`);
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
  try {
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
  try {
    const deletedTag = await tagModel.findByIdAndDelete(id);
    if (deletedTag) {
      return res.status(404).json({ message: `Not found Tag by id: ${id}` });
    } else {
      await deleteCache(`tags:${id}`, deletedTag);
      return res.status(200).json(deletedTag);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
