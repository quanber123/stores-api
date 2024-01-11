export const calculateFinalPrice = (product) => {
  const productTags = product.details.tags.map((t) => t.name);
  const saleTags = product.sale ? product.sale.tags.map((t) => t.name) : [];
  const isValidTag = saleTags.every((t) => productTags.includes(t));
  const isSaleValid = product.sale ? product.sale.endDate > Date.now() : false;
  const saleRate = product.sale ? product.sale.rate : 0;
  const price = product.price;
  if (isValidTag && product.sale && isSaleValid) {
    product.salePrice = price - (price * saleRate) / 100;
    return Math.round(product.salePrice);
  } else {
    return product.price;
  }
};

export const calculateFinalPricesForProducts = (products) => {
  return products.map((product) => {
    const productTags = product.details.tags.map((t) => t.name);
    const saleTag = product.sale ? product.sale.tag.name : null;
    const isValidTag = productTags.includes(saleTag);
    const saleRate = product.sale ? product.sale.rate : 0;
    const price = product.price;
    const isSaleValid = product.sale
      ? product.sale.endDate > Date.now()
      : false;

    if (isValidTag && isSaleValid) {
      product.salePrice = price - (price * saleRate) / 100;
      return { ...product, finalPrice: Math.round(product.salePrice) };
    } else {
      return { ...product, finalPrice: product.price };
    }
  });
};
