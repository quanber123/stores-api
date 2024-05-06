import mongoose from 'mongoose';
const websiteSchema = new mongoose.Schema({
  webId: String,
  icon: String,
  logo: String,
  vatNumber: Number || String,
  postCode: Number || String,
  shopName: String,
  email: String,
  app_email_password: String,
  web_url: String,
  currency: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'currency',
  },
});
websiteSchema.indexes({ webId: 1 });
export default mongoose.model('website', websiteSchema);
