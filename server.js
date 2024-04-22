import express from 'express';
import { connectDb } from './config/db.js';
import { config } from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import uid from 'uid-safe';
import cors from 'cors';
import corsOptions from './config/cors.js';
import { generateFakeBlog, generateFakeProduct } from './middleware/tools.js';
import { connectRedis } from './config/redis.js';
import { setCampaign } from './middleware/cron.js';
import { checkAndUpdateCoupon } from './controllers/dashboard/coupons.controllers.js';
import rateLimit from 'express-rate-limit';
import productModel from './models/product.model.js';
import blogModel from './models/blog.model.js';
import './modules/passport.js';
import { router_banner_dashboard } from './router/dashboard/banner.router.js';
import { router_blog_dashboard } from './router/dashboard/blog.router.js';
import { router_category_dashboard } from './router/dashboard/category.router.js';
import { router_contact_dashboard } from './router/dashboard/contact.router.js';
import { router_coupon_dashboard } from './router/dashboard/coupon.router.js';
import { routerFigures_dashboard } from './router/dashboard/figures.router.js';
import { router_notify_dashboard } from './router/dashboard/notify.router.js';
import { router_order_dashboard } from './router/dashboard/order.router.js';
import { router_product_dashboard } from './router/dashboard/product.router.js';
import { router_publisher_dashboard } from './router/dashboard/publisher.router.js';
import { router_status_order_dashboard } from './router/dashboard/status.order.router.js';
import { router_tag_dashboard } from './router/dashboard/tag.router.js';
import { router_address } from './router/users/address.router.js';
import { router_auth } from './router/users/auth.router.js';
import { router_banners } from './router/users/banner.router.js';
import { router_blog } from './router/users/blog.router.js';
import { router_cart } from './router/users/cart.router.js';
import { router_category } from './router/users/category.router.js';
import { router_contact } from './router/users/contact.router.js';
import { router_country } from './router/users/country.router.js';
import { router_notify } from './router/users/notify.router.js';
import { router_order } from './router/users/order.router.js';
import { router_product } from './router/users/product.router.js';
import { router_publisher } from './router/users/publisher.router.js';
import { router_status_order } from './router/users/status.order.router.js';
import { router_store } from './router/users/store.router.js';
import { router_store_dashboard } from './router/dashboard/store.router.js';
import { router_tag } from './router/users/tag.router.js';
import { router_user } from './router/users/user.router.js';
import { router_admin } from './router/dashboard/admin.router.js';
import { router_seo } from './router/dashboard/SEO.router.js';
config();
connectDb();
connectRedis();
const app = express();
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 100,
  handler: function (req, res) {
    res.status(429).json({
      error: true,
      success: false,
      status: 500,
      message: 'Too many requests!',
    });
  },
  skip: (req, res) => {
    if (req.ip === '::1') return true;
    return false;
  },
});
const port = process.env.PORT;
app.use(apiLimiter);
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
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
    Array.from({ length: 20 }, generateFakeProduct)
  );
  await productModel.create(PRODUCTS);
}
async function seedBlogData() {
  const BLOGS = await Promise.all(Array.from({ length: 20 }, generateFakeBlog));
  await blogModel.create(BLOGS);
}
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
setCampaign('0 0 * * * *', checkAndUpdateCoupon);
app.use(passport.initialize());
app.use(passport.session());
app.use(router_seo);
app.use(router_admin);
app.use(router_banner_dashboard);
app.use(router_blog_dashboard);
app.use(router_category_dashboard);
app.use(router_contact_dashboard);
app.use(router_coupon_dashboard);
app.use(routerFigures_dashboard);
app.use(router_notify_dashboard);
app.use(router_order_dashboard);
app.use(router_product_dashboard);
app.use(router_publisher_dashboard);
app.use(router_status_order_dashboard);
app.use(router_store_dashboard);
app.use(router_tag_dashboard);
app.use(router_address);
app.use(router_auth);
app.use(router_banners);
app.use(router_blog);
app.use(router_cart);
app.use(router_category);
app.use(router_contact);
app.use(router_country);
app.use(router_notify);
app.use(router_order);
app.use(router_product);
app.use(router_publisher);
app.use(router_status_order);
app.use(router_store);
app.use(router_tag);
app.use(router_user);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
