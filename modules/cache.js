import { client } from '../config/redis.js';
export const DEFAULT_EXPIRATION = 1 * 60 * 60 * 24 * 30;
export const checkCache = async (key, cb) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await client.get(key);
      if (data) {
        return resolve(JSON.parse(data));
      } else {
        const freshData = await cb();
        resolve(freshData);
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const updateCache = async (key, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const updateData = await JSON.parse(client.get(key));
      if (data._id === updateData._id)
        return resolve(client.setEx(key, DEFAULT_EXPIRATION, data));
      return reject('Something went wrong!');
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteCache = async (key, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deleteData = await JSON.parse(client.get(key));
      if (data._id === deleteData._id) return resolve(client.del(key));
      return reject('Something wen wrong!');
    } catch (error) {
      reject(error);
    }
  });
};
