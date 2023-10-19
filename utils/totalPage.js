export const totalPage = (total, products) => {
  const result = Math.ceil(total / products);
  return result;
};
