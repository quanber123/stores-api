import express, { urlencoded, static as expressStatic } from 'express';
import { connectDb } from './config/db.js';
import { config } from 'dotenv';
import cors from 'cors';
import corsOptions from './config/cors.js';
config();
connectDb();
const app = express();
const port = process.env.PORT || 3500;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
// const createUser = async () => {
//   const itemsOfPage = 5;
//   let currPage = 1;
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalPages = Math.ceil(totalUsers / itemsOfPage);
//     const user = await User.find()
//       .skip((currPage - 1) * itemsOfPage)
//       .limit(itemsOfPage);
//     console.log(user);
//     console.log(totalPages);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// createUser();
