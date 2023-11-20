import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
  image: String,
  description: {
    type: String,
    lowercase: true,
  },
});

export default mongoose.model('Category', categorySchema);
