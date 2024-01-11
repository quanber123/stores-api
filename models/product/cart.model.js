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
    salePrice: {
      type: Number,
    },
    finalPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
  },
});

export default mongoose.model('Cart', cartSchema);
