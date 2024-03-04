import mongoose from 'mongoose';

const wardsSchema = new mongoose.Schema({
  name: String,
  slug: String,
  type: String,
  name_with_type: String,
  code: String,
  path: String,
  path_with_type: String,
  parent_code: String,
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Wards', wardsSchema);
