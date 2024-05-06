import { redisClient } from '../../config/redis.js';
import aboutModel from '../../models/about.model.js';
import adminModel from '../../models/admin.model.js';

export const getAbout = async (req, res) => {
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
    const about = await aboutModel.find().sort({ created_at: -1 });
    if (about)
      return res
        .status(200)
        .json({ error: false, success: true, about: about });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const postAbout = async (req, res) => {
  const admin = req.decoded;
  const { title, text } = req.body;
  const file = req.file;
  try {
    if (!title || !text || !file)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad request!' });
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const existedAbout = await aboutModel.findOne({ title: title });
    if (existedAbout)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'This about already existed!',
      });
    const createdAbout = await aboutModel.create({
      title: title,
      text: text,
      image: file.path,
    });
    if (createdAbout) {
      await redisClient.del('about_us');
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Created about successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAbout = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { title, text } = req.body;
  const file = req.file;
  try {
    const about = {
      title: title,
      text: text,
      updated_at: Date.now(),
    };
    if (!title || !text)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad request!' });
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    if (file) {
      about.image = file.path;
    }

    const updatedAbout = await aboutModel.findByIdAndUpdate(id, about);
    if (updatedAbout) {
      await redisClient.del('about_us');
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated about successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAbout = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const deletedAbout = await aboutModel.findByIdAndDelete(id);
    if (deletedAbout) {
      await redisClient.del('about_us');
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted about successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
