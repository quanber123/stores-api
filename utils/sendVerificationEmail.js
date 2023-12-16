import nodemailer from 'nodemailer';

export const sendVerificationEmail = (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    // secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
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
