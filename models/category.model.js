import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  id: String,
  image: String,
  name: {
    type: String,
    lowercase: true,
  },
  description: String,
});
categorySchema.index({ name: 1 });
categorySchema.index({ id: 1 });
export default mongoose.model('Category', categorySchema);
