import express, { urlencoded, static as expressStatic } from 'express';
import { connectDb } from './config/db.js';
import { config } from './utils/importFile.js';
import cors from 'cors';
import corsOptions from './config/cors.js';
import routerProduct from './router/product.router.js';
import routerStore from './router/store.router.js';
config();
connectDb();
const app = express();
const port = process.env.PORT || 3500;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routerProduct);
app.use(routerStore);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
