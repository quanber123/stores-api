import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  created_at: {
    type: Date,
  },
  username: String,
  name: String,
  image: String,
  email: {
    type: String,
    unique: true,
  },
  oauthProvider: String,
});

export default mongoose.model('User', userSchema);
