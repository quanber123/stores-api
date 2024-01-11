import mongoose from 'mongoose';
const bannerSchema = new mongoose.Schema({
  image: String,
  content: {
    type: String,
    lowercase: true,
  },
  category: {
    type: String,
    lowercase: true,
  },
});

export default mongoose.model('Banner', bannerSchema);
