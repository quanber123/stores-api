import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  product: {
    id: String,
    name: {
      type: String,
      lowercase: true,
      required: true,
    },
    category: String,
    image: {
      type: String,
      require: true,
    },
    color: String,
    size: String,
    price: {
      type: Number,
      required: true,
    },
    amountSalePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});
cartSchema.indexes({ userId: 1 });
cartSchema.indexes({
  userId: 1,
  'product.name': 1,
  'product.color': 1,
  'product.size': 1,
});
cartSchema.indexes({ userId: 1 });
cartSchema.pre('create', function (next) {
  console.log(this);
});
export default mongoose.model('Cart', cartSchema);
