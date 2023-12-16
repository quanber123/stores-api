import mongoose from 'mongoose';
const defaultImg = 'avatar-trang.jpg';
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
    default: `localhost:3000/public/${defaultImg}`,
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
