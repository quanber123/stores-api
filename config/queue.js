import Queue from 'bull';
import { deleteCache } from '../modules/cache.js';
const QueueConfig = {
  redis: {
    password: process.env.PASSWORD,
  },
};
export const productDeletionQueue = new Queue('product-deletion', QueueConfig);
export const settingDeletionQueue = new Queue('settings-deletion', QueueConfig);
productDeletionQueue.process(async (job, cb) => {
  const productId = job.data.productId;
  await cb();
  await deleteCache(`products:${productId}`);
});
productDeletionQueue.on('completed', (job, result) => {
  console.log(`Job completed for product ${job.data.productId}`);
});

productDeletionQueue.on('failed', (job, err) => {
  console.log(`Job failed for product ${job.data.productId}: ${err}`);
});

settingDeletionQueue.process(async (job, cb) => {
  await cb();
  await deleteCache(`settings:*`);
});
settingDeletionQueue.on('completed', (job, result) => {
  console.log(`Job completed for settings `);
});

settingDeletionQueue.on('failed', (job, err) => {
  console.log(`Job failed for settings : ${err}`);
});
