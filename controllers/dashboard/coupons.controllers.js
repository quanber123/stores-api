import { setCampaign } from '../../middleware/cron.js';
import { optimizedImg } from '../../middleware/optimizedImg.js';
import couponModel from '../../models/coupon.model.js';
import productModel from '../../models/product.model.js';
import { deleteCache } from '../../modules/cache.js';
import adminModel from '../../models/admin.model.js';
export const getAllCoupons = async (req, res) => {
  const admin = req.decoded;
  const { page } = req.query;

  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth) return res.status(403).json({ message: 'UnAuthorization' });
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
      await productModel.findOneAndUpdate({ _id: product._id }, product);
      await deleteCache(`products:${product._id}`);
    });
    await Promise.all(updatePromises);
    await deleteCache(`products_all*`);
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
  const today = new Date();
  const couponStartDate = new Date(startDate);
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  const couponStartDateValue = couponStartDate.getDate();
  const couponStartMonth = couponStartDate.getMonth();
  const couponStartYear = couponStartDate.getFullYear();
  const coupon = {
    id: String(Date.now()).slice(-6),
    name: name,
    image: file.path,
    discount: Number(discount),
    max_discount: Number(max_discount),
    min_amount: Number(min_amount),
    category: category,
    tags: JSON.parse(tags),
    published: JSON.parse(published),
    startDate:
      todayDate === couponStartDateValue &&
      todayMonth === couponStartMonth &&
      todayYear === couponStartYear
        ? new Date().setHours(23, 59, 59, 999)
        : new Date(startDate).setHours(0, 0, 0, 1),
    endDate: new Date(endDate).setHours(23, 59, 59, 999),
  };
  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
    if (new Date(startDate) < new Date()) {
      return res
        .status(500)
        .json({ message: 'Day created can not less than today!' });
    }
    const duplicatedCoupon = await couponModel.findOne({ name: coupon.name });
    if (duplicatedCoupon) {
      return res.status(409).json({ message: 'This sale already existed!' });
    }
    const newSale = new couponModel(coupon);
    const savedCoupon = await newSale.save();
    if (savedCoupon) {
      return res
        .status(201)
        .json({ message: 'Coupon created successfully', savedCoupon });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const disabledCoupon = async (coupon) => {
  const updatedProducts = await productModel.find({ coupon: coupon._id });
  const updatePromises = updatedProducts.map(async (product) => {
    product.coupon = null;
    product.saleAmount = 0;
    product.finalPrice = product.price;
    await productModel.findOneAndUpdate({ _id: product._id }, product);
    await deleteCache(`products:${product._id}`);
    await deleteCache(`products_all*`);
  });
  await Promise.all(updatePromises);
};
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCoupon = await couponModel.findOneAndDelete({ id: id });
    if (deletedCoupon) {
      await disabledCoupon(deletedCoupon);
      return res.status(200).json({ message: 'Deleted successfully!' });
    }
    return res.status(404).json({ message: `Not found sale!` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const checkAndUpdateCoupon = async () => {
  console.log('checking!!!');
  try {
    const startDay = new Date().setHours(0, 0, 0, 0);
    const endDay = new Date().setHours(23, 59, 59, 999);
    const coupons = await couponModel.find({ expired: false });
    if (coupons.length > 0) {
      for (const coupon of coupons) {
        if (
          new Date(coupon.endDate) < endDay &&
          startDay > new Date(coupon.startDate)
        ) {
          await couponModel.updateOne({ id: coupon.id }, { expired: true });
          await disabledCoupon(coupon);
          console.log(`Coupon ${coupon.id} has expired.`);
        } else {
          await updateProductsForSale(coupon);
          console.log('updating!!!');
        }
      }
    }
  } catch (error) {
    console.error('Error occurred while checking expiration:', error);
  }
};
