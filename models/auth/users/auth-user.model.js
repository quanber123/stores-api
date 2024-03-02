import mongoose from 'mongoose';
const authUserSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: () => new Date(),
  },
  name: String,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'http://localhost:3000/public/avatar-trang.jpg',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    required: true,
  },
});
export default mongoose.model('AuthUser', authUserSchema);
