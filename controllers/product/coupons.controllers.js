import { optimizedImg } from '../../middleware/optimizedImg.js';
import couponModel from '../../models/product/coupon.model.js';
import productModel from '../../models/product/product.model.js';

export const getAllCoupons = async (req, res) => {
  const { page } = req.query;
  try {
    const totalCoupons = await couponModel.countDocuments();
    const totalPage = Math.ceil(totalCoupons / 10);
    const coupons = await couponModel
      .find()
      .populate(['category', 'tags'])
      .skip((Number(page) - 1) * 10)
      .limit(10)
      .lean();
    if (coupons)
      return res.status(200).json({ coupons: coupons, totalPage: totalPage });
    return res
      .status(404)
      .json({ message: 'There are currently no discount codes available!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateProductsForSale = async (coupon) => {
  try {
    const updatedProducts = await productModel
      .find({
        'details.tags': { $in: coupon.tags },
        'details.category': coupon.category,
        price: { $gte: coupon.min_amount },
      })
      .lean();
    const updatePromises = updatedProducts.map(async (product) => {
      let totalDiscount;
      const discount = (product.price * coupon.discount) / 100;
      if (discount > coupon.max_discount) {
        totalDiscount = coupon.max_discount;
      } else {
        totalDiscount = discount;
      }
      const salePrice = product.price - totalDiscount;
      product.coupon = coupon._id;
      product.saleAmount = totalDiscount;
      product.finalPrice = salePrice;
      await productModel.findOneAndUpdate({ id: product.id }, product);
    });
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating products for sale:', error);
  }
};
export const createCoupon = async (req, res) => {
  const {
    name,
    discount,
    max_discount,
    min_amount,
    category,
    tags,
    published,
    startDate,
    endDate,
  } = req.body;
  const file = req.file;
  const coupon = {
    id: String(Date.now()).slice(-6),
    name: name,
    image: null,
    discount: Number(discount),
    max_discount: Number(max_discount),
    min_amount: Number(min_amount),
    category: category,
    tags: JSON.parse(tags),
    published: JSON.parse(published),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };
  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
    const duplicatedCoupon = await couponModel.findOne({ name: coupon.name });
    if (duplicatedCoupon)
      return res.status(409).json({ message: 'This sale already existed!' });
    const optimized = await optimizedImg(file, 800, 800, 80);
    if (optimized) {
      coupon.image = `${process.env.APP_URL}/${optimized}`;
    } else {
      coupon.image = `${process.env.APP_URL}/${file.path}`;
    }
    const newSale = new couponModel(coupon);
    const savedCoupon = await newSale.save();
    if (savedCoupon.published) {
      await updateProductsForSale(savedCoupon);
    }
    res
      .status(201)
      .json({ message: 'Coupon created successfully', savedCoupon });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const publishedCoupon = async (req, res) => {
  const { id } = req.params;
  const { published } = req.body;
  try {
    const updatedCoupon = await couponModel.findOneAndUpdate(
      { id: id },
      { published: published }
    );
    if (updatedCoupon && updatedCoupon.published) {
      await updateProductsForSale(updatedCoupon);
      return res
        .status(200)
        .json({ message: 'Coupon updated successfully', updatedCoupon });
    }
    if (updatedCoupon) {
      return res
        .status(200)
        .json({ message: 'Coupon updated successfully', updatedCoupon });
    }
    return res.status(404).json({ message: 'Failed to update' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    discount,
    max_discount,
    min_amount,
    category,
    tags,
    published,
    startDate,
    endDate,
  } = req.body;
  const file = req.file;
  const coupon = {
    name: name,
    image: null,
    discount: Number(discount),
    max_discount: Number(max_discount),
    min_amount: Number(min_amount),
    category: category,
    tags: JSON.parse(tags),
    published: JSON.parse(published),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };
  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
    const updatedCoupon = await couponModel.findOneAndUpdate(
      { id: id },
      coupon
    );
    if (updatedCoupon && updatedCoupon.published) {
      await updateProductsForSale(updatedCoupon);
      res
        .status(200)
        .json({ message: 'Coupon updated successfully', updatedCoupon });
    }
    if (updatedCoupon) {
      res
        .status(200)
        .json({ message: 'Coupon updated successfully', updatedCoupon });
    }
    return res.status(404).json({ message: 'Failed to update' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateProducts = async (coupon) => {
  const updatedProducts = await productModel.find({ coupon: coupon._id });
  const updatePromises = updatedProducts.map(async (product) => {
    product.coupon = null;
    product.saleAmount = 0;
    product.finalPrice = product.price;
    await productModel.findOneAndUpdate({ id: product.id }, product);
  });
  await Promise.all(updatePromises);
};
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCoupon = await couponModel.findOneAndDelete({ id: id });
    if (deletedCoupon) {
      await updateProducts(deletedCoupon);
      return res.status(200).json({ message: 'Deleted successfully!' });
    }
    return res.status(404).json({ message: `Not found sale!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const checkAndUpdateCoupon = async (req, res) => {
  try {
    const currTime = new Date();
    const expiredDiscount = await couponModel.find({
      endDate: { $lte: currTime },
      expired: false,
    });
    if (expiredDiscount.length > 0) {
      for (const coupon of expiredDiscount) {
        await couponModel.updateOne({ id: coupon.id }, { expired: true });
        await updateProducts(coupon);
        console.log(`Coupon ${code.id} has expired.`);
      }
      return res.status(200).json(expiredDiscount);
    } else {
      return res.status(200).json({ message: 'No coupons expired!' });
    }
  } catch (error) {
    console.error('Error occurred while checking expiration:', error);
  }
};
