import contactModel from '../../models/contact.model.js';
import { sendMailToAdmin } from '../../utils/sendEmail.js';
export const createContact = async (req, res) => {
  const { email, message } = req.body;
  try {
    if (!email || !message)
      return res.status(400).json({
        error: true,
        success: false,
        message: `email or message is missed!`,
      });

    const newContact = new contactModel({
      id: new Date().getTime(),
      email: email,
      message: message,
    });
    const savedContact = await newContact.save();

    if (savedContact) {
      await sendMailToAdmin(email, message);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'We will respond to you as soon as possible!',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
