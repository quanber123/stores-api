import mongoose from 'mongoose';
const pageSchema = new mongoose.Schema({
  page: String,
  title: String,
  text: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});
pageSchema.indexes({ page: 1 });
export default mongoose.model('pages', pageSchema);
