import Queue from 'bull';
const QueueConfig = {
  redis: {
    password: process.env.PASSWORD,
  },
};
export const productDeletionQueue = new Queue('product-deletion', QueueConfig);

productDeletionQueue.process(async (job) => {
  const productId = job.data.productId;
  await productModel.findByIdAndDelete(productId);
  await redisClient.del(`products:${productId}`);
});

productDeletionQueue.on('completed', (job, result) => {
  console.log(`Job completed for product ${job.data.productId}`);
});

productDeletionQueue.on('failed', (job, err) => {
  console.log(`Job failed for product ${job.data.productId}: ${err}`);
});
