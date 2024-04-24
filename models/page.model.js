import mongoose from 'mongoose';
const pageSchema = new mongoose.Schema({
  webId: String,
  icon: String,
  logo: String,
  vatNumber: Number,
  postCode: Number,
  shopName: Number,
  email: String,
  app_email_password: String,
});
pageSchema.indexes({ webId: 1 });
export default mongoose.model('page', pageSchema);
