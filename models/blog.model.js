import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  author: {
    type: String,
  },
  imgSrc: String,
  title: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  open_paragraph: String,
  body_paragraph: String,
  close_paragraph: String,
  quotes: String,
  categories: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Category',
  },
  tags: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Tag',
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  published: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: 'blog',
  },
});
blogSchema.index({ categories: 1 });
blogSchema.index({ tag: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ categories: 1, tag: 1 });
export default mongoose.model('Blog', blogSchema);
