import { redisClient } from '../../../config/redis.js';
import notifyModel from '../../../models/auth/users/notify.model.js';
import settingsModel from '../../../models/auth/users/settings.model.js';
import { firstLoadingCache } from '../../../modules/cache.js';

export const getAllNotifications = async (req, res) => {
  try {
    const data = await firstLoadingCache(`notifications:*`, notifyModel, []);
    return res.status(200).json({ notifications: data !== null ? data : [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createNotify = async (req, res) => {
  const { type, description } = req.body;
  try {
    const existedNotify = await notifyModel.findOne({
      type: type,
      description: description,
    });
    if (existedNotify)
      return res
        .status(409)
        .json({ message: `Notify name ${description} existed!` });
    const newNotify = await notifyModel.create({
      type: type,
      description: description,
    });
    await redisClient.set(`notifications:${newNotify._id}`);
    const updatedSettings = await settingsModel.updateMany(
      { user: { $exists: true } },
      {
        $push: {
          notifications: {
            type: type,
            description: description,
            enabled: true,
            created_at: Date.now(),
          },
        },
      }
    );
    await Promise.all([newNotify, updatedSettings]);
    if (!newNotify || updatedSettings.matchedCount === 0) {
      return res.status(401).json({ message: 'Failed to create!' });
    }
    return res.status(200).json({ message: 'Created Successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateNotify = async (req, res) => {
  const { id, description } = req.body;
  try {
    const updateNotify = await notifyModel.findByIdAndUpdate(
      id,
      {
        $set: { description: description },
      },
      { new: true }
    );
    if (updateNotify) {
      await redisClient.set(`notifications:${updateNotify._id}`);
      return res.status(200).json({ message: 'Updated Successfully!' });
    }
    return res
      .status(404)
      .json({ message: `Notify name ${description} not existed!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteNotify = async (req, res) => {
  const { id } = req.body;
  try {
    const deletedNotify = await notifyModel.findByIdAndDelete(id);
    if (deletedNotify)
      return res.status(200).json({ message: 'Deleted Successfully!' });
    return res
      .status(409)
      .json({ message: `Notify name ${deletedNotify} not existed!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
