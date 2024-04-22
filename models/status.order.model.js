import mongoose from 'mongoose';

const statusOrderSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
  },
  number: Number,
  color: String,
  backgroundColor: String,
  validRole: String,
});
statusOrderSchema.indexes({ name: 1 });
statusOrderSchema.indexes({ name: 1, validRole: 1 });
export default mongoose.model('StatusOrder', statusOrderSchema);
