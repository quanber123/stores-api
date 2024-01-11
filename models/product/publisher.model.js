import mongoose from 'mongoose';
const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  location: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    minLength: 8,
    required: true,
  },
  email: {
    type: String,
    minLength: 10,
    lowercase: true,
  },
});

export default mongoose.model('Publisher', publisherSchema);
