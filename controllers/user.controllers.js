import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import oauthUserModel from '../models/oauth-user.model.js';
import authUserModel from '../models/auth-user.model.js';
import { hashPassword } from '../utils/hashInfo.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';

//GET User by token
export const getUserByToken = async (req, res) => {
  const { email } = req.decoded;
  try {
    const existedOauthUser = await oauthUserModel.findOne({ email: email });
    const existedAuthUser = await authUserModel.findOne({ email: email });
    Promise.all([existedAuthUser, existedOauthUser]);
    console.log(existedAuthUser, existedOauthUser);
    if (existedOauthUser || existedAuthUser) {
      return res.status(200).json({
        user: {
          email: existedAuthUser?.email || existedOauthUser?.email,
          name: existedAuthUser?.name || existedOauthUser?.name,
          image: existedAuthUser?.image || existedOauthUser?.image,
          isVerified:
            existedAuthUser?.isVerified || existedOauthUser?.isVerified,
        },
      });
    } else {
      return res.status(404).json({ message: `Not found user ${email}` });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//User Login Auth
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ messages: 'Username and Password are required!' });
  }
  try {
    const findUser = await authUserModel.findOne({ email: email });
    if (!findUser) return res.sendStatus(401);
    const match = await bcrypt.compare(password, findUser.password);
    if (match) {
      const token = jwt.sign(
        {
          email: findUser.email,
          password: findUser.password,
          image: findUser.image,
          isVerified: findUser.isVerified,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `90d` }
      );
      return res.status(200).json({
        accessToken: token,
        user: {
          email: findUser.email,
          password: findUser.password,
          image: findUser.image,
          isVerified: findUser.isVerified,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// User Register Auth
export const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const duplicatedAuthUser = await oauthUserModel.findOne({
      email: email,
    });
    const duplicatedOauthUser = await authUserModel.findOne({
      email: email,
    });
    Promise.all([duplicatedAuthUser, duplicatedOauthUser]);
    if (duplicatedAuthUser || duplicatedOauthUser)
      return res.status(409).json({ message: 'Email already existed!' });
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const user = new authUserModel({
      name: name,
      email: email,
      password: hashedPassword,
      verificationCode: verificationCode,
    });
    await user.save();
    const token = jwt.sign(
      {
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: `90d` }
    );
    sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      message: 'Please check your email to verified account!',
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        isVerified: false,
      },
      accessToken: token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
export const verifiedAccount = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await authUserModel.findOne({
      email: email,
      verificationCode: code,
    });
    if (user) {
      user.isVerified = true;
      await user.save();
      const token = jwt.sign(
        {
          email: user.email,
          password: user.password,
          image: user.image,
          isVerified: user.isVerified,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `90d` }
      );
      const responseUser = {
        email: user.email,
        password: user.password,
        image: user.image,
        isVerified: user.isVerified,
      };
      return res.status(200).json({
        message: 'Email verified successfully.',
        user: responseUser,
        accessToken: token,
      });
    } else {
      res.status(400).json({ error: 'Invalid verification code.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const sendCodeVerifiedAccount = async (req, res) => {
  const { email } = req.body;
  try {
    const duplicatedAuthUser = await oauthUserModel.findOne({
      username: email,
    });
    const duplicatedOauthUser = await authUserModel.findOne({
      email: email,
    });
    if (duplicatedAuthUser || duplicatedOauthUser)
      return res.status(409).json({ message: 'Email already existed!' });
    const verificationCode = generateVerificationCode();
    await authUserModel.findOneAndUpdate({
      email: email,
      verificationCode: verificationCode,
    });
    sendVerificationEmail(email, verificationCode);
    return res
      .status(200)
      .json({ message: 'Please check email to verified your account!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
