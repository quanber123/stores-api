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
});

const detailSchema = new mongoose.Schema({
  variants: [variantSchema],
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
  shortDescription: String,
  description: String,
  weight: String,
  dimensions: String,
  materials: String,
  stores: { type: mongoose.SchemaTypes.ObjectId, ref: 'Store' },
  publishers: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Publisher',
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  isSale: {
    type: Boolean,
    default: false,
  },
  sale: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Sale',
  },
  type: {
    type: String,
    default: () => 'product',
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
  reviews: [
    {
      avatar: String,
      content: String,
      vote: Number,
    },
  ],
});
productSchema.pre('save', function (next) {});
export default mongoose.model('Product', productSchema);
