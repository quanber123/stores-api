import { settingDeletionQueue } from '../../config/queue.js';
import { redisClient } from '../../config/redis.js';
import notifyModel from '../../models/notify.model.js';
import settingsModel from '../../models/settings.model.js';
import adminModel from '../../models/admin.model.js';
export const getAllNotifications = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const data = await notifyModel.find().lean();
    return res.status(200).json({
      error: false,
      success: true,
      settings_notifications: data !== null ? data : [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createNotify = async (req, res) => {
  const { type, description } = req.body;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
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

    await redisClient.set(`settings_notifications:${newNotify._id}`);
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
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
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
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const deletedNotify = await notifyModel.findByIdAndDelete(id);
    if (deletedNotify) {
      const updatedSettingsUser = await settingsModel.find({
        notifications: deletedNotify._id,
      });
      updatedSettingsUser.forEach((setting) => {
        settingDeletionQueue.add(
          {
            settings: setting._id,
          },
          async () => {
            const updatedSettings = updatedSettingsUser.notifications.filter(
              (n) => !n.equals(deletedNotify._id)
            );
            await settingsModel.findByIdAndUpdate(setting._id, {
              notifications: updatedSettings,
            });
          }
        );
      });
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted Successfully!',
      });
    }
    return res.status(409).json({
      error: true,
      success: false,
      message: `Notify name ${deletedNotify} not existed!`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
