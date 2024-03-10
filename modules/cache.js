import { redisClient } from '../config/redis.js';
export const firstLoadingCache = async (key, model, populate, sort) => {
  console.log(sort);
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
    return freshData;
  }
};
export const updateCache = async (key, data) => {
  const dataCache = await redisClient.get(key);
  if (data._id === JSON.parse(dataCache._id)) return redisClient.set(key, data);
  return 'Something went wrong!';
};

export const deleteCache = async (key, data) => {
  const dataCache = await redisClient.get(key);
  if (data._id === JSON.parse(dataCache._id)) return redisClient.del(key);
  return 'Something went wrong!';
};
