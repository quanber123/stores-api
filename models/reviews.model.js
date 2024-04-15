import mongoose from 'mongoose';
const reviewsSchema = new mongoose.Schema({
  productId: String,
  username: String,
  rate: Number,
  reviews: String,
  avatar: String,
  showUser: Boolean,
  created_at: {
    type: Date,
    default: () => Date.now(),
  },
});
reviewsSchema.methods.calculateAverageRating = async function () {
  const totalReviews = await this.model('Reviews').countDocuments({
    productId: this.productId,
  });

  if (totalReviews === 0) {
    return 0;
  }

  const totalRating = await this.model('Reviews').aggregate([
    {
      $match: { productId: this.productId },
    },
    {
      $group: {
        _id: null,
        totalRating: { $sum: '$rate' },
      },
    },
  ]);

  const averageRating = totalRating[0].totalRating / totalReviews;
  return Math.round(averageRating * 10) / 10;
};
reviewsSchema.indexes({ productId: 1 });
export default mongoose.model('Reviews', reviewsSchema);
