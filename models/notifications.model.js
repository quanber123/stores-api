import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  userId: String,
  itemId: String || null,
  type: String,
  message: String,
  url_client: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  read: {
    type: Boolean,
    default: false,
  },
});
notificationSchema.indexes({ userId: 1 });
notificationSchema.indexes({ userId: 1, itemId: 1 });
export default mongoose.model('notifications', notificationSchema);
