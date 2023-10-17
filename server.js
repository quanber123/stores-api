import mongoose from 'mongoose';
import User from './User.js';
const connectDb = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1/testdb');
    console.log('connected!');
  } catch (error) {
    console.error(error);
  }
};
connectDb();

const createUser = async () => {
  const itemsOfPage = 5;
  let currPage = 1;
  try {
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / itemsOfPage);
    const user = await User.find()
      .skip((currPage - 1) * itemsOfPage)
      .limit(itemsOfPage);
    console.log(user);
    console.log(totalPages);
  } catch (error) {
    console.log(error.message);
  }
};

createUser();
