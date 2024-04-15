import mongoose from 'mongoose';
const oauthUserSchema = new mongoose.Schema({
  id: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  email: String,
  name: String,
  image: String,
  email: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  oauthProvider: String,
});
oauthUserSchema.indexes({ id: 1 });
export default mongoose.model('OauthUser', oauthUserSchema);
