import contactModel from '../../models/contact.model.js';
import adminModel from '../../models/admin.model.js';
import { sendMailToAdmin } from '../../utils/sendEmail.js';
export const getAllContacts = async (req, res) => {
  const { page } = req.query;
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
    const getAllContacts = await contactModel
      .find()
      .skip((page - 1) * 10)
      .limit(10)
      .lean();

    return res.status(200).json({
      error: false,
      success: true,
      contacts: getAllContacts !== null ? getAllContacts : [],
      currPage: page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
