import blogModel from '../../models/blog.model.js';
import commentModel from '../../models/comment.model.js';
import categoryModel from '../../models/category.model.js';
import tagModel from '../../models/tag.model.js';
import adminModel from '../../models/admin.model.js';
export const getAllBlogs = async (req, res) => {
  const admin = req.decoded;
  const { category, tag, page, search } = req.query;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    let query = {};
    const foundCategory = category
      ? await categoryModel.findOne({ name: category })
      : '';
    const foundTag = tag ? await tagModel.findOne({ name: tag }) : '';
    if (foundCategory || foundTag) {
      if (foundCategory) {
        query = {
          categories: foundCategory?._id,
        };
      }
      if (foundTag) {
        query = {
          tags: foundTag?._id,
        };
      }
      if (foundCategory && foundTag) {
        query = {
          categories: foundCategory?._id,
          tags: foundTag?._id,
        };
      }
    }
    if (search != '' && search) {
      const unaccentedQueryString = unidecode(search);
      const regex = new RegExp(unaccentedQueryString, 'i');
      query.title = { $search: regex };
    }
    const totalBlogs = await blogModel.countDocuments(query);
    const total = Math.ceil(totalBlogs / 8);
    const findAllBlogs = await blogModel
      .find(query)
      .populate(['categories', 'tags'])
      .sort({ created_at: -1 })
      .skip((page - 1) * 8)
      .limit(8)
      .lean();

    return res.status(200).json({
      error: false,
      success: true,
      blogs: findAllBlogs ? findAllBlogs : [],
      totalPage: total ? total : 0,
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
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
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const existedBlog = await blogModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate(['categories', 'tags'])
      .lean();
    if (!existedBlog)
      return res
        .status(404)
        .json({ error: true, success: false, message: 'Blog not exist!' });
    return res
      .status(200)
      .json({ error: false, success: true, blog: existedBlog });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const admin = req.decoded;
  const blog = req.body;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization' });
    const newBlog = await blogModel.findOne({ title: blog.title });
    if (newBlog)
      return res.status(404).json({
        error: true,
        success: false,
        message: 'Blog already existed!',
      });
    const createdBlog = await blogModel.create(blog);
    if (createdBlog)
      return res
        .status(200)
        .json({ error: false, success: true, message: 'Create Successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getAllComments = async (req, res) => {
  const admin = req.decoded;
  const { id } = req.params;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
    const existedComment = await commentModel
      .findOne({ blogId: id })
      .populate('blogId');

    return res.status(200).json({
      error: false,
      success: true,
      comment: existedComment ? existedComment : {},
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
