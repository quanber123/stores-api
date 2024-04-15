import mongoose from 'mongoose';
const authUserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
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
    default: `${process.env.APP_URL}/public/avatar-trang.jpg`,
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
authUserSchema.indexes({ id: 1 });
export default mongoose.model('AuthUser', authUserSchema);
