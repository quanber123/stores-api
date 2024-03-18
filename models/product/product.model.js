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
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
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
  coupon: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Coupon',
    default: null,
  },
  saleAmount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
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
  published: {
    type: Boolean,
    default: true,
  },
  // reviews: [
  //   {
  //     type: mongoose.SchemaTypes.ObjectId,
  //     ref: 'Reviews',
  //   },
  // ],
});
// productSchema.pre('save', function (next) {
//   if (this.sale && this.salePrice) {
//     this.finalPrice = this.salePrice;
//   } else {
//     this.finalPrice = this.price;
//   }
//   next();
// });
export default mongoose.model('Product', productSchema);
