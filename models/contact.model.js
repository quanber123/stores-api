import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: String,
  created_at: {
    type: Date,
    default: () => new Date(),
  },
});
export default mongoose.model('Contact', contactSchema);
