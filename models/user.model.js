import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
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
  age: {
    type: Number,
    default: null,
  },
  date: {
    type: Date,
    required: true,
  },
  phone: {
    type: Number,
    minLength: 8,
    required: true,
  },
  address: {
    type: String,
  },
  oauthProvider: String,
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('User', userSchema);
