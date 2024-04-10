import mongoose from 'mongoose';

let dbConnection = null;

export const connectDb = async () => {
  if (!dbConnection) {
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
      mongoose.connect(
        `mongodb://${username}:${password}@127.0.0.1/${dbName}?authSource=admin`,
        options
      );
      dbConnection = mongoose.connection;
      console.log('MongoDB connected!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }
  return dbConnection;
};
