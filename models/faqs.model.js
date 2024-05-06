import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  title: String,
  description: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});
faqSchema.indexes({ title: 1 });
export default mongoose.model('faqs', faqSchema);
