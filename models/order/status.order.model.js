import mongoose from 'mongoose';

const statusOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
  color: String,
});
export default mongoose.model('StatusOrder', statusOrderSchema);
