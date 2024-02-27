import mongoose from 'mongoose';
const statusOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
});

export default mongoose.model('statusOrder', statusOrderSchema);
