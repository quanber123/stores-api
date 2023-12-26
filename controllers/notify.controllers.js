import notifyModel from '../models/notify.model.js';

export const getAllNotifications = async (req, res) => {
  try {
    const existedNotifications = await notifyModel.find().lean();
    if (!existedNotifications)
      return res.status(404).json({ message: 'Not found notifications!' });
    return res.status(200).json({ notifications: existedNotifications });
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
    await notifyModel.create({
      type: type,
      description: description,
    });
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
    if (updateNotify)
      return res.status(200).json({ message: 'Updated Successfully!' });
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
