import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  blogId: String,
  comments: [
    {
      user: {
        name: String,
        image: String,
      },
      text: String,
      created_at: {
        type: Date,
        default: () => Date.now(),
      },
    },
  ],
});
commentSchema.index({ blogId: 1 });
export default mongoose.model('BlogComments', commentSchema);
