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

export default mongoose.model('Category', categorySchema);
