import mongoose from 'mongoose';
const favoriteSchema = new mongoose.Schema({
  products: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    },
  ],
  userId: String,
});

export default mongoose.model('Favorite', favoriteSchema);
