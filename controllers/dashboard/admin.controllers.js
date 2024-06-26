import adminModel from '../../models/admin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomToken } from '../../utils/generateVerificationCode.js';
import { redisClient } from '../../config/redis.js';
export const getAdminByToken = async (req, res) => {
  const admin = req.decoded;
  try {
    const data = await adminModel.find({ email: admin.email });
    if (data) return res.status(200).json(admin);
    return res.status(404).json({ message: `Not found admin ${admin.email}` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await adminModel.findOne({ email: email });

    if (!data)
      return res.status(404).json({ message: 'Account not register!' });

    const match = await bcrypt.compare(password, data.password);
    if (match) {
      const admin = {
        _id: data._id,
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        image: data.image,
        role: data.role,
      };
      // const token = jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET, {
      //   expiresIn: '1d',
      // });
      const token = await randomToken();
      await redisClient.setEx(
        `accessToken:${token}`,
        60 * 60 * 24,
        JSON.stringify(admin)
      );
      return res.status(200).json({ token: token });
    }
    return res.status(403).json({ message: 'UnAuthorization!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
