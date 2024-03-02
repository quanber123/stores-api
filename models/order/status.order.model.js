import mongoose from 'mongoose';

const statusOrderSchema = new mongoose.Schema({
  name: String,
  color: String,
});
export default mongoose.model('StatusOrder', statusOrderSchema);
