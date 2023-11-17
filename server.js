import express, { urlencoded, static as expressStatic } from 'express';
import { connectDb } from './config/db.js';
import { config } from './utils/importFile.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import cors from 'cors';
import corsOptions from './config/cors.js';
import routerProduct from './router/product.router.js';
import routerStore from './router/store.router.js';
import routerPublisher from './router/publisher.router.js';
import routerTag from './router/tag.router.js';
import routerCategory from './router/category.router.js';
import { routerUser } from './router/user.router.js';
config();
connectDb();
const app = express();
const port = process.env.PORT || 3500;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'REST API with Cars (CRUD)',
      description: 'A REST API built with Express and MongoDB. This API',
    },
  },
  apis: ['./docs/swagger.js'],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use(
  '/api-docs',
  swaggerUiExpress.serve,
  swaggerUiExpress.setup(swaggerDocs)
);
app.use(routerProduct);
app.use(routerStore);
app.use(routerPublisher);
app.use(routerTag);
app.use(routerCategory);
app.use(routerUser);
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
