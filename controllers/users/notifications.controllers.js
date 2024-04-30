import notificationsModel from '../../models/notifications.model.js';

export const getNotifications = async (req, res) => {
  const { offset, limit } = req.query;
  const { user } = req.decoded;
  try {
    const notRead = await notificationsModel.countDocuments({
      userId: user.id,
      read: false,
    });
    const total = await notificationsModel.countDocuments({
      userId: user.id,
    });
    const getNotifications = await notificationsModel
      .find({ userId: user.id })
      .sort({ created_at: -1 })
      .skip(offset ? offset : 0)
      .limit(limit ? limit : 10);
    return res.status(200).json({
      error: false,
      success: true,
      notifications: getNotifications,
      notRead: notRead,
      total: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateNotifications = async (req, res) => {
  const { id } = req.params;
  const { user } = req.decoded;
  const { read } = req.body;
  try {
    const updatedNotifications = await notificationsModel.findOneAndUpdate(
      { _id: id, userId: user.id },
      { read: read }
    );
    if (updatedNotifications)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated notification successfully!',
        notification: updatedNotifications,
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: 'Not found notification!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteNotifications = async (req, res) => {
  const { id } = req.params;
  const { user } = req.decoded;
  try {
    const deletedNotifications = await notificationsModel.findOneAndDelete({
      _id: id,
      userId: user.id,
    });
    if (deletedNotifications)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted notification successfully!',
        notification: deletedNotifications,
      });
    return res.status(404).json({
      error: true,
      success: false,
      message: 'Not found notification!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
