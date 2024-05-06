import adminModel from '../../models/admin.model.js';
import faqsModel from '../../models/faqs.model.js';
import pageModel from '../../models/page.model.js';
import { redisClient } from '../../config/redis.js';
export const getPage = async (req, res) => {
  const admin = req.decoded;
  const { page } = req.params;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const pageData = await pageModel.findOne({ page: page });
    if (pageData)
      return res.status(200).json({
        error: false,
        success: true,
        page: pageData,
      });

    return res.status(404).json({
      error: true,
      success: false,
      message: 'Not found page!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updatePage = async (req, res) => {
  const admin = req.decoded;
  const { page } = req.params;
  const { title, text } = req.body;
  try {
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
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const updatedPage = await pageModel.findOneAndUpdate(
      { page: page },
      {
        title: title,
        text: text,
        updated_at: Date.now(),
      }
    );
    if (updatedPage)
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated Page Successfully!',
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFaqs = async (req, res) => {
  const { offset, limit } = req.query;
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const faqs = await faqsModel.find().sort({ created_at: -1 });

    return res.status(200).json({ error: false, success: true, faqs: faqs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFaq = async (req, res) => {
  const admin = req.decoded;
  const { title, description } = req.body;
  try {
    if (!title || !description)
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
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const existedFaq = await faqsModel.findOne({ title: title });
    if (existedFaq)
      return res
        .status(409)
        .json({ error: true, success: false, message: 'Already existed faq!' });
    const createdFaq = await faqsModel.create({
      title: title,
      description: description,
    });
    if (createdFaq) {
      await redisClient.del(`faq:*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Created faq successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFaq = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    if (!title || !description)
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
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const updatedFaq = await faqsModel.findByIdAndUpdate(id, {
      title: title,
      description: description,
      updated_at: Date.now(),
    });
    if (updatedFaq) {
      await redisClient.del(`faq:*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated faq successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFaq = async (req, res) => {
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
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const deletedFaq = await faqsModel.findByIdAndDelete(id);
    if (deletedFaq) {
      await redisClient.del(`faq:*`);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Deleted faq successfully!',
      });
    }
    return res.status(404).json({
      error: true,
      success: false,
      message: 'Not found faq!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
