import { redisClient } from '../config/redis.js';
export const firstLoadingCache = async (key, model, populate, sort) => {
  const reply = await redisClient.keys(key);
  if (reply.length) {
    // console.log(`${key} was cached!`);
    const data = await Promise.all(
      reply.map(async (item) => {
        return JSON.parse(await redisClient.get(item));
      })
    );
    return data;
  } else {
    // console.log(`${key} was not cached!`);
    const dataFromMongo =
      populate !== null
        ? await model
            .find()
            .populate([...populate])
            .sort({ ...sort })
            .lean()
        : await model.find().lean();
    const newCacheData = dataFromMongo.map(async (data) => {
      await redisClient.set(
        `${key.replace('*', `${data._id}`)}`,
        JSON.stringify(data)
      );
    });
    await Promise.all(newCacheData);
    return null;
  }
};
export const checkCache = async (key, cb) => {
  const data = await redisClient.get(key);
  if (data !== null) {
    return JSON.parse(data);
  } else {
    const freshData = await cb();
    if (freshData !== null) {
      await redisClient.set(key, JSON.stringify(freshData));
    }
    return freshData;
  }
};
export const updateCache = async (key, data) => {
  const dataCache = await redisClient.get(key);
  if (!dataCache) {
    return 'Cache not found!';
  }
  try {
    await redisClient.set(key, JSON.stringify(data));
    console.log('Cache updated successfully!');
    return;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return;
  }
};

export const deleteCache = async (key) => {
  const dataCache = await redisClient.get(key);
  if (!dataCache) {
    return 'Cache not found!';
  }
  try {
    await redisClient.del(key);
    console.log('Cache deleted successfully!');
    return;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return 'Error deleting cache!';
  }
};
