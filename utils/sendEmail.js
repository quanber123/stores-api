import nodemailer from 'nodemailer';
import emailAppModel from '../models/auth/admin/email.app.model.js';
const defaultEmail = async () => {
  const user = await emailAppModel.findOne({ default: true }).lean();
  return user;
};
export const sendVerificationEmail = async (email, verificationCode) => {
  const user = await defaultEmail();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // secure: false,
    auth: {
      user: user.email,
      pass: user.app_password,
    },
  });
  const mailOptions = {
    from: 'CozaStore',
    to: email,
    subject: 'Credential verification code',
    html: `
      <p>Thank you for registering with our app!</p>
      <p>Please verify your email by the code: ${verificationCode}</p>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending verification email:', error);
    } else {
      console.log('Verification email sent:', info.response);
    }
  });
};

export const sendMailToAdmin = async (email, message) => {
  const user = await defaultEmail();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // secure: false,
    auth: {
      user: user.email,
      pass: user.app_password,
    },
  });
  const mailOptions = {
    from: email,
    to: user.email,
    subject: 'Contact',
    text: `Email: ${email}`,
    html: `<p>Email: ${email}</p><br><p>message: ${message}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending verification email:', error);
    } else {
      console.log('Verification email sent:', info.response);
    }
  });
};
