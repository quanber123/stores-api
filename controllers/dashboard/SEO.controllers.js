import { redisClient } from '../../config/redis.js';
import SEOModel from '../../models/SEO.model.js';
import adminModel from '../../models/admin.model.js';
import blogModel from '../../models/blog.model.js';
import productModel from '../../models/product.model.js';
import { checkCache, updateCache } from '../../modules/cache.js';

export const getSeoDashboard = async (req, res) => {
  try {
    const page = await SEOModel.find();
    if (page) return res.status(200).json(page ? page : []);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getSeo = async (req, res) => {
  const { curPage } = req.params;
  try {
    const cachedPage = await checkCache(`web_seo:${curPage}`, async () => {
      const page = await SEOModel.findOne({ page: curPage });
      return page;
    });
    if (cachedPage) return res.status(200).json(cachedPage);

    return res.status(404).json({ message: 'Not Found Page!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getSeoDetailsPage = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  try {
    if (type === 'product') {
      const data = await productModel.findById(
        id,
        'name images details.description'
      );
      return res.status(200).json(data);
    }
    if (type === 'blog') {
      const data = await blogModel.findById(id, 'title imgSrc');
      return res.status(200).json(data);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const setSeo = async (req, res) => {
  const admin = req.decoded;
  const { page, title, description } = req.body;
  try {
    if (!page || !title || !description)
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
    const newPage = {
      page: page,
      title: title,
      description: description,
      setIndex: setIndex,
    };
    const existedPage = await SEOModel.findOne({ page: page });
    if (existedPage)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Seo page already existed!',
      });

    const createdPage = await SEOModel.create(newPage);
    if (createdPage) {
      await redisClient.set(
        `web_seo:${createdPage.page}`,
        JSON.stringify(createdPage)
      );
      return res.status(201).json({
        error: false,
        success: true,
        message: 'Created Seo page successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSeo = async (req, res) => {
  const { page } = req.params;
  const admin = req.decoded;
  const { title, description } = req.body;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const updatedSeo = await SEOModel.findOneAndUpdate(
      { page: page },
      {
        title: title,
        description: description,
      },
      {
        new: true,
      }
    );
    if (updatedSeo) {
      await updateCache(`web_seo:${updatedSeo.page}`, updatedSeo);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated seo page successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
