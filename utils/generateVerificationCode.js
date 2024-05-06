import crypto from 'crypto';

export const generateVerificationCode = () => {
  return crypto.randomBytes(2).toString('hex');
};

export const randomToken = async () => {
  return crypto.randomBytes(64).toString('hex');
};
