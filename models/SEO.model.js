import mongoose from 'mongoose';
const seoSchema = new mongoose.Schema({
  page: String,
  title: String,
  description: String,
  icon: String,
  logo: String,
  setIndex: {
    type: Boolean,
    default: true,
  },
});
seoSchema.indexes({ page: 1 });
export default mongoose.model('SEO', seoSchema);
