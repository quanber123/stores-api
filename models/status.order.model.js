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
statusOrderSchema.indexes({ name: 1 });
export default mongoose.model('StatusOrder', statusOrderSchema);
