import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: String,
  paymentMethod: String,
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentInfo: {
    user_name: String,
    phone: Number,
    message: String,
    address: String,
    products: [
      {
        id: String,
        name: {
          type: String,
        },
        category: String,
        image: {
          type: String,
        },
        color: String,
        size: String,
        price: {
          type: Number,
        },
        amountSalePrice: {
          type: Number,
          default: 0,
        },
        salePrice: {
          type: Number,
          default: 0,
        },
        finalPrice: {
          type: Number,
        },
        quantity: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
        },
        isReview: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalSalePrice: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    bin: {
      type: String,
      default: null,
    },
    accountNumber: {
      type: String,
      default: null,
    },
    accountName: {
      type: String,
      default: null,
    },
    amount: Number,
    description: {
      type: String,
      default: null,
    },
    orderCode: Number,
    currency: {
      type: String,
      default: 'VND',
    },
    paymentLinkId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: null,
      lowercase: true,
    },
    checkoutUrl: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      default: null,
    },
  },
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
  updated_at: {
    type: Date,
    default: () => Date.now(),
  },
});
orderSchema.indexes({ user: 1 });
export default mongoose.model('Order', orderSchema);
