import mongoose from 'mongoose';
const currencySchema = new mongoose.Schema({
  name: String,
  symbol: String,
  flag: String,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  enabled: {
    type: Boolean,
    default: false,
  },
});
currencySchema.indexes({ name: 1 });
export default mongoose.model('currency', currencySchema);
