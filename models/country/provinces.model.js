import mongoose from 'mongoose';

const provincesSchema = new mongoose.Schema({
  name: String,
  slug: String,
  type: String,
  name_with_type: String,
  code: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Provinces', provincesSchema);
