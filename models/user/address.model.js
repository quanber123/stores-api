import mongoose from 'mongoose';
const addressSchema = new mongoose.Schema({
  userId: String,
  name: String,
  phone: String || Number,
  country: String,
  state: String,
  city: String,
  address: String,
  district: String,
  zipcode: {
    type: String,
    default: null,
  },
  district: String,
  geoinfo: {
    region: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    geoinfo_confirm: {
      type: Boolean,
      default: false,
    },
  },
  isDefault: { type: Boolean, default: false },
});

export default mongoose.model('Address', addressSchema);
