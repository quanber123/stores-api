import mongoose from 'mongoose';
const oauthUserSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  email: String,
  name: String,
  image: String,
  email: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  oauthProvider: String,
});
export default mongoose.model('OauthUser', oauthUserSchema);
