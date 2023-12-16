import express, { urlencoded, static as expressStatic } from 'express';
import { config } from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import './passport/passport.js';
import { connectDb } from './config/db.js';
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUiExpress from 'swagger-ui-express';
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
config();
connectDb();
const app = express();
const port = process.env.PORT;
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
    name: 'store-session',
  })
);
app.use(passport.initialize());
app.use(passport.session());
// const swaggerOptions = {
//   swaggerDefinition: {
//     info: {
//       title: 'REST API with Cars (CRUD)',
//       description: 'A REST API built with Express and MongoDB. This API',
//     },
//   },
//   apis: ['./docs/swagger.js'],
// };
// const swaggerDocs = swaggerJSDoc(swaggerOptions);
// app.use(
//   '/api-docs',
//   swaggerUiExpress.serve,
//   swaggerUiExpress.setup(swaggerDocs)
// );
app.use(routerAuth);
app.use(routerProduct);
app.use(routerBanner);
app.use(routerStore);
app.use(routerPublisher);
app.use(routerTag);
app.use(routerCategory);
app.use(routerUser);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
