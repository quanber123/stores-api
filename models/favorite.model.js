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
favoriteSchema.indexes({ products: 1 });
favoriteSchema.indexes({ userId: 1 });
export default mongoose.model('Favorite', favoriteSchema);
