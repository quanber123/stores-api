import { redisClient } from '../../config/redis.js';
import SEOModel from '../../models/SEO.model.js';
import adminModel from '../../models/admin.model.js';
import blogModel from '../../models/blog.model.js';
import productModel from '../../models/product.model.js';
import { checkCache } from '../../modules/cache.js';

export const getSeo = async (req, res) => {
  const { curPage } = req.params;
  try {
    const cachedPage = await checkCache(`page:${curPage}`, async () => {
      const page = await SEOModel.findOne({ page: curPage });
      return page;
    });
    if (cachedPage) return res.status(200).json(cachedPage);

    return res.status(404).json({ message: 'Not Found Page!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
  } catch (error) {}
};
export const setSeo = async (req, res) => {
  const admin = req.decoded;
  const { page, title, description, setIndex } = req.body;
  const files = req.files;
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
      icon: files[0].path ? files[0].path : '',
      logo: files[1].path ? files[1].path : '',
    };
    const existedPage = await SEOModel.findOne({ page: page });
    if (existedPage)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Page already existed!',
      });

    const createdPage = await SEOModel.create(newPage);
    if (createdPage) {
      await redisClient.set(
        `page:${createdPage.page}`,
        JSON.stringify(createdPage)
      );
      return res.status(201).json({
        error: false,
        success: true,
        message: 'Created page successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
