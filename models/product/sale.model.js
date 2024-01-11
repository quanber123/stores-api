import mongoose from 'mongoose';
const saleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  tag: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Tag',
  },
  startDate: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
  endDate: {
    type: Date,
    required: true,
    default: () => {
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      return fiveDaysFromNow;
    },
  },
  active: Boolean,
});

export default mongoose.model('Sale', saleSchema);
