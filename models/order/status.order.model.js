import mongoose from 'mongoose';

const statusOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
  number: Number,
  color: String,
  backgroundColor: String,
});
export default mongoose.model('StatusOrder', statusOrderSchema);
