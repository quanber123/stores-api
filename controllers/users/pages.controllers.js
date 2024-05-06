import adminModel from '../../models/admin.model.js';
import faqsModel from '../../models/faqs.model.js';
import pageModel from '../../models/page.model.js';
import { checkCache } from '../../modules/cache.js';
export const getPage = async (req, res) => {
  const { page } = req.params;
  try {
    const data = await checkCache(`page:${page}`, async () => {
      const pageData = await pageModel.findOne({ page: page });
      return pageData;
    });
    if (data)
      return res.status(200).json({
        error: false,
        success: true,
        page: data,
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
export const getFaqs = async (req, res) => {
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
    const cachedFaqs = checkCache('faqs', async () => {
      const faqs = await faqsModel.find().sort({ created_at: -1 });
      return faqs;
    });

    return res
      .status(200)
      .json({ error: false, success: true, faqs: cachedFaqs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
