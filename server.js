import express, { urlencoded, static as expressStatic } from 'express';
import { connectDb } from './config/db.js';
import { config } from 'dotenv';
import './modules/passport.js';
import passport from 'passport';
import session from 'express-session';
import uid from 'uid-safe';
import cors from 'cors';
import corsOptions from './config/cors.js';
import routerProduct from './router/product/product.router.js';
import routerStore from './router/product/store.router.js';
import routerPublisher from './router/product/publisher.router.js';
import routerTag from './router/tag/tag.router.js';
import routerCategory from './router/category/category.router.js';
import routerUser from './router/user/user.router.js';
import routerAuth from './router/user/auth.router.js';
import routerBanner from './router/product/banner.router.js';
import routerBlog from './router/blog/blog.router.js';
import routerNotify from './router/user/notify.router.js';
import { generateFakeBlog, generateFakeProduct } from './middleware/tools.js';
import routerSale from './router/product/sale.router.js';
import routerCart from './router/product/cart.router.js';
import routerPayment from './router/product/payment.router.js';
import { connectRedis } from './config/redis.js';
import { connectElasticSearch, esClient } from './config/elasticsearch.js';
import { firstLoadingElasticSearch } from './modules/elasticsearch.js';
import productModel from './models/product/product.model.js';
import blogModel from './models/blog/blog.model.js';
import categoryModel from './models/category/category.model.js';
import tagModel from './models/tag/tag.model.js';
import routerFigures from './router/product/figures.router.js';
import serverless from 'serverless-http';
config();
connectRedis();
connectDb();
connectElasticSearch();
firstLoadingElasticSearch(
  ['products', 'blogs'],
  [
    {
      type: 'products',
      model: productModel,
      populate: ['details.category', 'details.tags', 'sale'],
    },
    {
      type: 'blogs',
      model: blogModel,
      populate: ['categories', 'tags'],
    },
  ]
);
const app = express();
const port = process.env.PORT;
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    genid: function (req) {
      return uid.sync(18);
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    name: 'store-session',
  })
);
// async function seedProductData() {
//   const PRODUCTS = await Promise.all(
//     Array.from({ length: 500 }, generateFakeProduct)
//   );
//   await productModel.create(PRODUCTS);
// }
// async function seedBlogData() {
//   const BLOGS = await Promise.all(
//     Array.from({ length: 500 }, generateFakeBlog)
//   );
//   await blogModel.create(BLOGS);
// }
// seedProductData()
//   .then(() => {
//     console.log('Data seeded successfully.');
//   })
//   .catch((error) => {
//     console.error('Error seeding data:', error.message);
//   });
// seedBlogData()
//   .then(() => {
//     console.log('Data seeded successfully.');
//   })
//   .catch((error) => {
//     console.error('Error seeding data:', error.message);
//   });
app.use(passport.initialize());
app.use(passport.session());
app.use(routerAuth);
app.use(routerProduct);
app.use(routerBlog);
app.use(routerBanner);
app.use(routerStore);
app.use(routerPublisher);
app.use(routerTag);
app.use(routerCategory);
app.use(routerSale);
app.use(routerNotify);
app.use(routerCart);
app.use(routerUser);
app.use(routerPayment);
app.use(routerFigures);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
export const handler = serverless(app);
