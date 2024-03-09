import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
  },
  phone: {
    type: Number,
    minLength: 8,
    required: true,
  },
  role: {
    type: String,
    lowercase: true,
    required: true,
  },
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  default: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Admin', adminSchema);
