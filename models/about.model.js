import mongoose from 'mongoose';
const aboutSchema = new mongoose.Schema({
  title: String,
  image: String,
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
aboutSchema.indexes({ title: 1 });
export default mongoose.model('about', aboutSchema);
