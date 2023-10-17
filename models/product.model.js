import mongoose from 'mongoose';
const detailSchema = new mongoose.Schema({
  variants: [
    {
      size: {
        type: String,
        lowercase: true,
      },
      color: {
        type: String,
        lowercase: true,
      },
      quantity: {
        type: Number,
        default: 0,
      },
      inStock: {
        type: Boolean,
        default: true,
      },
    },
  ],
  description: {
    type: String,
    minLength: 20,
  },
  publishers: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Publisher',
  },
});
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
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
  details: [detailSchema],
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
});

export default mongoose.model('Product', productSchema);
