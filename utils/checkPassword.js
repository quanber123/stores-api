import bcrypt from 'bcryptjs';
export const checkPassword = async (password, hashedPassword) => {
  try {
    // So sánh mật khẩu với mật khẩu đã hash
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};
