import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    required: true,
  },
  image: String,
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  max_discount: Number,
  min_amount: Number,
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Category',
  },
  tags: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Tag',
    },
  ],
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  expired: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model('Coupon', couponSchema);
