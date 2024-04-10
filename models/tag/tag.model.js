import mongoose from 'mongoose';
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
});
tagSchema.indexes({ name: 1 });
export default mongoose.model('Tag', tagSchema);
