import crypto from 'crypto';

export const generateVerificationCode = () => {
  return crypto.randomBytes(2).toString('hex');
};
