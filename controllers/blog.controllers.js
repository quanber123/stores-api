import authUserModel from '../models/auth-user.model.js';
import blogModel from '../models/blog.model.js';
import oauthUserModel from '../models/oauth-user.model.js';
import categoryModel from '../models/category.model.js';
import tagModel from '../models/tag.model.js';
export const getAllBlogs = async (req, res) => {
  const { category, tag, page } = req.query;
  let query = {};
  try {
    const foundCategory = category
      ? await categoryModel.findOne({ name: category })
      : '';
    const foundTag = tag ? await tagModel.findOne({ name: tag }) : '';
    if (foundCategory !== '' || foundTag !== '') {
      if (foundCategory !== '') {
        query['categories'] = foundCategory?._id;
      }
      if (foundTag !== '') {
        query['tags'] = foundTag?._id;
      }
      if (foundCategory && foundTag) {
        query = {
          categories: foundCategory?._id,
          tags: foundTag?._id,
        };
      }
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
    if (findAllBlogs) {
      return res.status(200).json({
        blogs: findAllBlogs,
        totalPage: total,
        currentPage: Number(page),
      });
    } else {
      return res.status(404).json({ messages: 'Not found blogs in database' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const [existedBlog, relatedBlogs] = await Promise.all([
      blogModel
        .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        .populate(['categories', 'tags'])
        .populate({
          path: 'comments.user',
          model: 'AuthUser',
        })
        .populate({
          path: 'comments.user',
          model: 'OauthUser',
        })
        .lean(),
      // blogModel
      //   .find({ _id: { $ne: id } })
      //   .sort({ created_at: -1 })
      //   .populate(['categories', 'tags'])
      //   .populate({
      //     path: 'comments.user',
      //     model: 'AuthUser',
      //   })
      //   .populate({
      //     path: 'comments.user',
      //     model: 'OauthUser',
      //   })
      //   .limit(4)
      //   .lean(),
    ]);

    if (!existedBlog) {
      return res.status(404).json({ message: 'Blog not exist!' });
    }
    existedBlog.comments?.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return res.status(200).json({ blog: existedBlog });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const blog = req.body;
  try {
    const newBlog = await blogModel.findOne({ title: blog.title });
    if (newBlog) {
      return res.status(404).json({ message: 'Blog already existed!' });
    } else {
      await blogModel.create(blog);
      return res.status(200).json({ message: 'Create Successfully!' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const postComment = async (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const { userId, text } = req.body;
  try {
    const authUser = await authUserModel.findById(userId);
    const oauthUser = await oauthUserModel.findById(userId);
    if (authUser || oauthUser) {
      let comment = {
        user: userId,
        text,
      };
      const existedBlog = await blogModel.findById(id);
      if (!existedBlog) {
        return res.status(404).json({ message: 'Blog not exist!' });
      }
      existedBlog.comments.push(comment);
      await existedBlog.save();
      return res.status(201).json({ message: 'Post comment successfully!' });
    }
    return res.status(404).json({ message: 'Not Found User' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
