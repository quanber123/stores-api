import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    lowercase: true,
    required: true,
  },
  color: {
    type: String,
    lowercase: true,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
  inStock: {
    type: Boolean,
    default: true,
    required: true,
  },
  description: String,
  stores: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
});

const detailSchema = new mongoose.Schema({
  variants: [variantSchema],
  category: {
    type: String,
  },
  publishers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
  details: detailSchema,
});

export default mongoose.model('Product', productSchema);
