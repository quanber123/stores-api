import mongoose from 'mongoose';
export const connectDb = async () => {
  try {
    const username = process.env.DATABASE_USERNAME;
    const password = process.env.DATABASE_PASSWORD;
    const db_name = process.env.DATABASE_NAME;
    await mongoose.connect(
      `mongodb://${username}:${password}@127.0.0.1/${db_name}?authSource=admin`
      // `mongodb://${username}:${password}@127.0.0.1/${db_name}`
    );
    console.log('mongodb connected!');
  } catch (error) {
    console.error(error);
  }
};
