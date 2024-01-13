import { faker } from '@faker-js/faker';
import categoryModel from '../models/category/category.model.js';
import tagModel from '../models/tag/tag.model.js';
import storeModel from '../models/product/store.model.js';
import publisherModel from '../models/product/publisher.model.js';
const getRandomElements = (array, numberOfElements) => {
  const shuffledArray = [...array].sort(() => 0.5 - Math.random());
  return shuffledArray.slice(0, numberOfElements);
};

export const generateFakeProduct = async () => {
  const sizes = ['SM', 'MD', 'LG', 'XL', '2XL'];
  const category = await categoryModel.find().lean();
  const tags = await tagModel.find().lean();
  const stores = await storeModel.find().lean();
  const publishers = await publisherModel.find().lean();
  // Generate random number of images (between 1 and 5)
  const numberOfImages = faker.number.int({ min: 1, max: 5 });
  const images = Array.from({ length: numberOfImages }, () =>
    faker.image.urlPicsumPhotos()
  );

  // Generate random number of variants (between 1 and 3)
  const numberOfVariants = faker.number.int({ min: 1, max: 3 });
  const variants = Array.from({ length: numberOfVariants }, () => ({
    size: getRandomElements(sizes, 1)[0],
    color: faker.color.human(),
    quantity: faker.number.int({ min: 0, max: 50 }),
    inStock: faker.datatype.boolean(),
  }));

  const fakeProduct = {
    name: faker.commerce.productName(),
    images: images,
    price: faker.number.int({ min: 10, max: 1000, precision: 0.01 }),
    sale: null,
    salePrice: 0,
    finalPrice: 0,
    details: {
      variants: variants,
      category: getRandomElements(category, 1)[0]._id,
      tags: getRandomElements(tags, faker.number.int({ min: 1, max: 5 })),
      shortDescription: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      weight: `${faker.number.int({ min: 1, max: 10 })} kg`,
      dimensions: `${faker.number.int({
        min: 10,
        max: 50,
      })}x${faker.number.int({ min: 10, max: 50 })}x${faker.number.int({
        min: 10,
        max: 50,
      })} cm`,
      materials: faker.commerce.productMaterial(),
      stores: getRandomElements(stores, 1)[0]._id,
      publishers: getRandomElements(publishers, 1)[0]._id,
    },
    reviews: [],
  };

  return fakeProduct;
};

export const generateFakeBlog = async () => {
  const category = await categoryModel.find().lean();
  const tags = await tagModel.find().lean();
  const fakeBlog = {
    author: faker.person.fullName(),
    imgSrc: faker.image.urlPicsumPhotos(),
    title: faker.lorem.sentence(),
    open_paragraph: faker.lorem.sentence(),
    body_paragraph: faker.lorem.paragraph(),
    close_paragraph: faker.lorem.sentence(),
    quotes: faker.lorem.sentence(),
    categories: getRandomElements(category, 1)[0]._id,
    tags: getRandomElements(tags, faker.number.int({ min: 1, max: 5 })),
  };
  return fakeBlog;
};
