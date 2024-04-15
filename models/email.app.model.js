import mongoose from 'mongoose';
const emailAppSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  app_password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  default: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('EmailApp', emailAppSchema);
