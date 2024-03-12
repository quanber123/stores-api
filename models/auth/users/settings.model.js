import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
  user: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  notifications: [],
});

export default mongoose.model('Setting', settingsSchema);
