import contactModel from '../../../models/auth/users/contact.model.js';
import { sendMailToAdmin } from '../../../utils/sendEmail.js';

export const getAllContacts = async (req, res) => {
  const { page } = req.query;

  try {
    const getAllContacts = await contactModel
      .find()
      .skip((page - 1) * 10)
      .limit(10)
      .lean();

    return res.status(200).json({
      contacts: getAllContacts !== null ? getAllContacts : [],
      currPage: page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  const { email, message } = req.body;
  try {
    if (!email || !message)
      return res.status(400).json({ message: `email or message is missed!` });

    const newContact = new contactModel({
      id: new Date().getTime(),
      email: email,
      message: message,
    });
    const savedContact = await newContact.save();

    if (savedContact) {
      await sendMailToAdmin(email, message);
    }
    return res
      .status(200)
      .json({ message: 'We will respond to you as soon as possible!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
