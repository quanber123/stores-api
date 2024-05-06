import blogModel from '../../models/blog.model.js';
import commentModel from '../../models/comment.model.js';
import categoryModel from '../../models/category.model.js';
import tagModel from '../../models/tag.model.js';
import { checkCache, updateCache } from '../../modules/cache.js';
export const getAllBlogs = async (req, res) => {
  const { category, tag, page } = req.query;
  let query = {};
  try {
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
    const totalBlogs = await blogModel.countDocuments({
      ...query,
      published: true,
    });
    const total = Math.ceil(totalBlogs / 8);
    const findAllBlogs = await blogModel
      .find({ ...query, published: true })
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

  try {
    const existedBlog = await blogModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate(['categories', 'tags'])
      .lean();

    if (!existedBlog) {
      return res.status(404).json({ message: 'Blog not exist!' });
    }
    return res
      .status(200)
      .json({ error: false, success: true, blog: existedBlog });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllComments = async (req, res) => {
  const { id } = req.params;
  try {
    const commentData = await checkCache(`comments:${id}`, async () => {
      const existedComment = await commentModel
        .findOne({ blogId: id })
        .sort({ 'comments.created_at': -1 })
        .populate('blogId');
      return existedComment ? existedComment : {};
    });
    const sortComment = commentData?.comments?.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    return res.status(200).json({
      error: false,
      success: true,
      comment: {
        blogId: commentData._id,
        comments: sortComment ? [...sortComment] : [],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const postComment = async (req, res) => {
  const { id } = req.params;
  const user = req.decoded;
  const { text } = req.body;
  try {
    let comment = {
      user: {
        name: user.name,
        image: user.image,
      },
      text,
      created_at: new Date(),
    };
    const duplicatedBlog = await commentModel.findOne({ blogId: id });
    if (duplicatedBlog) {
      const updatedComment = await commentModel.findOneAndUpdate(
        { blogId: id },
        {
          $push: { comments: comment },
        },
        {
          new: true,
        }
      );
      if (updatedComment) {
        await updateCache(`comments:${id}`, updatedComment);
      }
    } else {
      await commentModel.create({
        blogId: id,
        comments: [comment],
      });
    }
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Post comment successfully!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
