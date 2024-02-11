import { createClient } from 'redis';
export const client = createClient();
export const connectRedis = async () => {
  client.on('error', (err) => {
    console.log('Redis Client Error', err);
  });
  client.on('ready', () => console.log('Redis is ready'));
  await client.connect();
  await client.ping();
};
