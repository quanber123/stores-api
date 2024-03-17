import mongoose from 'mongoose';
const bannerSchema = new mongoose.Schema({
  id: String,
  image: String,
  content: String,
  sub_content: String,
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Category',
  },
});

export default mongoose.model('Banner', bannerSchema);
