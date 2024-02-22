import { createClient } from 'redis';
export const redisClient = createClient({
  password: process.env.PASSWORD,
});
export const connectRedis = async () => {
  redisClient.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  redisClient.on('ready', () => console.log('Redis is ready'));
  await redisClient.connect();
  await redisClient.ping();
};
