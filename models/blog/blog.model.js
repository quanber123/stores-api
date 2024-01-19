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
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
      },
      // onUserType: {
      //   type: String,
      //   enum: ['AuthUser', 'OauthUser'],
      // },
      text: String,
      created_at: {
        type: Date,
        default: () => Date.now(),
      },
    },
  ],

  totalComments: {
    type: Number,
    default: 0,
  },
});
blogSchema.pre('save', function (next) {
  this.totalComments = this.comments.length;
  next();
});
export default mongoose.model('Blog', blogSchema);
