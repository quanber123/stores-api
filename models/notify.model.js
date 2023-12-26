import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['product', 'blog'],
    required: true,
  },
  description: {
    type: String,
    lowercase: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.model('Notifications', notificationSchema);
