import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  avatar: String,
  cmt: String,
  dateCmt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

export default mongoose.model('CommentUser', commentSchema);
