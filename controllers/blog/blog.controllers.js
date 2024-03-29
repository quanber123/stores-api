import blogModel from '../../models/blog/blog.model.js';
// import { esClient } from '../../config/elasticsearch.js';
import { docWithoutId } from '../../modules/elasticsearch.js';
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
        query = {
          categories: foundCategory?._id,
        };
      }
      if (foundTag !== '') {
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
      blogs: findAllBlogs ? findAllBlogs : [],
      totalPage: total ? total : 0,
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// export const getAllBlogs = async (req, res) => {
//     const { category, tag, page } = req.query;
//     let queryAll = {
//       match_all: {},
//     };
//     let mQuery = {
//       bool: {
//         must: [],
//       },
//     };
//     let sortQuery = [{ created_at: 'desc' }];
//     let totalPage = 0;
//     try {
//       let nestedConditions = [];
//       if (tag) {
//         nestedConditions.push({ term: { 'tags.name': tag } });
//       }
//       if (category) {
//         nestedConditions.push({ term: { 'categories.name': category } });
//       }

//       if (nestedConditions.length > 0) {
//         mQuery.bool.must = [...nestedConditions];
//       }
//       const finalQuery = mQuery.bool.must.length > 0 ? mQuery : queryAll;
//       const data = await esClient.search({
//         index: 'blogs',
//         body: {
//           sort: sortQuery,
//           query: finalQuery,
//           from: ((page || 1) - 1) * 8,
//           size: 8,
//           _source: true,
//           track_total_hits: true,
//         },
//       });
//       const totalBlogs = data.hits.total.value;
//       totalPage = Math.ceil(totalBlogs / 8);
//       return res.status(200).json({
//         blogs: data.hits.hits.flatMap((h) => [{ ...h._source, _id: h._id }]),
//         totalPage: totalPage,
//         currentPage: page,
//       });
//     } catch (error) {
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// };

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const [existedBlog, relatedBlogs] = await Promise.all([
      blogModel
        .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
        .populate(['categories', 'tags'])
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
// export const getBlogById = async (req, res) => {
//     const { id } = req.params;
//     try {
//       await esClient.update({
//         index: 'blogs',
//         id: id,
//         body: {
//           script: {
//             source: 'ctx._source.views += params.views',
//             params: {
//               views: 1,
//             },
//           },
//         },
//         refresh: true,
//       });
//       const data = await esClient.get({
//         index: 'blogs',
//         id: id,
//       });
//       await blogModel.findByIdAndUpdate(
//         id,
//         { $inc: { views: 1 } },
//         { new: true }
//       );
//       if (!data) {
//         return res.status(404).json({ message: 'Blog not exist!' });
//       } else {
//         data._source.comments?.sort(
//           (a, b) => new Date(b.created_at) - new Date(a.created_at)
//         );

//         return res
//           .status(200)
//           .json({ blog: { ...data._source, _id: data._id } });
//       }
//     } catch (error) {
//       return res.status(500).json({ message: error.message });
//     }
//   }

export const createBlog = async (req, res) => {
  const blog = req.body;
  try {
    const newBlog = await blogModel.findOne({ title: blog.title });
    if (newBlog) {
      return res.status(404).json({ message: 'Blog already existed!' });
    } else {
      const newBlog = new blogModel(blog);
      await newBlog.save();
      // await esClient.index({
      //   index: 'blogs',
      //   id: savedBlog._id,
      //   document: docWithoutId(savedBlog),
      // });
      return res.status(200).json({ message: 'Create Successfully!' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const postComment = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { user } = req.decoded;
  const { text } = req.body;
  try {
    let comment = {
      user: {
        id: user.id,
        image: user.image,
        name: user.name,
      },
      text,
      created_at: new Date(),
    };
    // await esClient.update({
    //   index: 'blogs',
    //   id: id,
    //   body: {
    //     script: {
    //       source: 'ctx._source.comments.add(params.comment)',
    //       params: {
    //         comment: comment,
    //       },
    //     },
    //   },
    //   refresh: true,
    // });
    // const data = await esClient.get({
    //   index: 'blogs',
    //   id: id,
    // });
    await blogModel.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );

    return res.status(201).json({ message: 'Post comment successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
