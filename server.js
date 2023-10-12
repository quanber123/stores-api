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
  const user = await User.create({
    name: 'Hung le',
    age: 20,
    email: 'hungle@gmail.com',
  });
  console.log(user);
  await user.save();
  console.log(user);
  // try {
  //   // const user = await User.where('name')
  //   //   .equals('Tran Quan')
  //   //   .populate('bestFriend')
  //   //   .limit(2);
  //   // console.log(user);
  //   // const user = await User.findByName('Tran Quan');
  //   const user = await User.findOne({
  //     name: 'Tran Quan',
  //     email: 'quantm103@gmail.com',
  //   });
  //   console.log(user.nameEmail);
  // } catch (error) {
  //   console.log(error.message);
  // }
};

createUser();
