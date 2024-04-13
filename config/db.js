import mongoose from 'mongoose';

export const connectDb = async () => {
  try {
    const username = process.env.DATABASE_USERNAME;
    const password = process.env.DATABASE_PASSWORD;
    const dbName = process.env.DATABASE_NAME;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 1,
      maxPoolSize: 50,
    };
    await mongoose.connect(
      `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=admin`,
      options
    );

    console.log('MongoDB connected!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};
