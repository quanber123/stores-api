import bcrypt from 'bcryptjs';
export const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

export const hashCode = (code) => {
  return bcrypt.hash(code, 10);
};
