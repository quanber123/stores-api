import mongoose from 'mongoose';
const seoSchema = new mongoose.Schema({
  page: {
    type: String,
    lowercase: true,
  },
  title: String,
  description: String,
  setIndex: {
    type: Boolean,
    default: true,
  },
});
seoSchema.indexes({ page: 1 });
export default mongoose.model('SEO', seoSchema);
