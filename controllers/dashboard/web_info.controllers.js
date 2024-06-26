import { redisClient } from '../../config/redis.js';
import adminModel from '../../models/admin.model.js';
import websiteModel from '../../models/website.js';
import { checkCache } from '../../modules/cache.js';
export const getWebsiteInfo = async (req, res) => {
  try {
    const cachedPage = await checkCache(`web_info`, async () => {
      const page = await websiteModel
        .findOne({}, 'webId icon logo shopName vatNumber postCode currency')
        .populate('currency');
      return page;
    });
    if (cachedPage) return res.status(200).json(cachedPage);

    return res.status(404).json({ message: 'Not Found Page!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export const getWebsiteDashboard = async (req, res) => {
  const admin = req.decoded;
  try {
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const page = await websiteModel.findOne().populate('currency');
    return res.status(200).json(page ? page : null);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateWebsite = async (req, res) => {
  const { id } = req.params;
  const admin = req.decoded;
  const { vatNumber, postCode, shopName, email, app_email_password, currency } =
    req.body;
  const files = req.files;
  try {
    if (!vatNumber || !postCode || !shopName || !email || !app_email_password)
      return res
        .status(400)
        .json({ error: true, success: false, message: 'Bad request!' });
    const auth = await adminModel.findOne({
      email: admin.email,
      role: admin.role,
    });
    if (!auth)
      return res
        .status(403)
        .json({ error: true, success: false, message: 'UnAuthorization!' });
    const website = {
      vatNumber: vatNumber,
      postCode: postCode,
      shopName: shopName,
      email: email,
      app_email_password: app_email_password,
      currency: currency,
    };
    if (files[0]?.path) {
      website.icon = files[0].path;
    }
    if (files[1]?.path) {
      website.logo = files[0].path;
    }
    const updatedWebsite = await websiteModel.findOneAndUpdate(
      { webId: id },
      {
        ...website,
      }
    );
    if (updatedWebsite) {
      await redisClient.set(`web_info`, JSON.stringify(updatedWebsite));
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Updated website successfully!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
