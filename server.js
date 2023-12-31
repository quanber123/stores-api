import express, { urlencoded, static as expressStatic } from 'express';
import { connectDb } from './config/db.js';
import { config } from 'dotenv';
import './passport/passport.js';
import passport from 'passport';
import session from 'express-session';
import uid from 'uid-safe';
import cors from 'cors';
import corsOptions from './config/cors.js';
import routerProduct from './router/product.router.js';
import routerStore from './router/store.router.js';
import routerPublisher from './router/publisher.router.js';
import routerTag from './router/tag.router.js';
import routerCategory from './router/category.router.js';
import routerUser from './router/user.router.js';
import routerAuth from './router/auth.router.js';
import routerBanner from './router/banner.router.js';
import routerBlog from './router/blog.router.js';
import routerNotify from './router/notify.router.js';
import { generateFakeBlog, generateFakeProduct } from './middleware/tools.js';
import productModel from './models/product.model.js';
import blogModel from './models/blog.model.js';
config();
connectDb();
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
async function seedProductData() {
  const PRODUCTS = await Promise.all(
    Array.from({ length: 50 }, generateFakeProduct)
  );
  await productModel.insertMany(PRODUCTS);
}
async function seedBlogData() {
  const BLOGS = await Promise.all(Array.from({ length: 50 }, generateFakeBlog));
  await blogModel.insertMany(BLOGS);
}
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
app.use(routerNotify);
app.use(routerUser);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
