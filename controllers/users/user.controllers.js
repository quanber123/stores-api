import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { hashPassword } from '../../utils/hashInfo.js';
import {
  generateVerificationCode,
  randomToken,
} from '../../utils/generateVerificationCode.js';
import { sendVerificationEmail } from '../../utils/sendEmail.js';
import { updateCache } from '../../modules/cache.js';
import authUserModel from '../../models/auth-user.model.js';
import oauthUserModel from '../../models/oauth-user.model.js';
import settingsModel from '../../models/settings.model.js';
import { redisClient } from '../../config/redis.js';
//GET User by token
export const getUserByToken = async (req, res) => {
  const user = req.decoded;
  try {
    if (!user) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found user ${user.email}`,
      });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//User Login Auth
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      success: false,
      message: 'Username and Password are required!',
    });
  }
  try {
    const findUser = await authUserModel.findOne({ email: email }).lean();

    if (!findUser)
      return res.status(404).json({ message: 'Account not register!' });
    
    if (match) {
      const user = {
        _id: findUser._id,
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        password: findUser.password,
        image: findUser.image,
        isVerified: findUser.isVerified,
      };
      // const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
      //   expiresIn: Number(process.env.DEFAULT_EXPIRATION),
      // });
      const token = await randomToken();
      await redisClient.setEx(
        `accessToken:${token}`,
        Number(process.env.DEFAULT_EXPIRATION),
        JSON.stringify(user)
      );
      return res.status(200).json({
        error: false,
        success: true,
        accessToken: token,
      });
    } else {
      return res.status(403).json({
        error: true,
        success: false,
        message: 'Password is not incorrect!',
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
    const duplicatedOauthUser = await authUserModel.findOne({
      email: email,
    });
    const duplicatedAuthUser = await oauthUserModel.findOne({
      email: email,
    });
    if (duplicatedOauthUser || duplicatedAuthUser)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Email already existed!',
      });
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const user = new authUserModel({
      id: new Date().getTime(),
      name: name,
      email: email,
      password: hashedPassword,
      verificationCode: verificationCode,
      isVerified: false,
    });
    await user.save();

    const token = jwt.sign(
      {
        user: user,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.DEFAULT_EXPIRATION }
    );
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      error: false,
      success: true,
      message: 'Please check your email to verified account!',
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
      const allSettingsNotify = await notifyModel.find().lean();
      user.isVerified = true;
      await user.save();
      await settingsModel.create({
        user: user.id,
        notifications: [...allSettingsNotify],
      });

      const responseUser = {
        _id: user._id,
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified,
      };
      // const token = jwt.sign(
      //   { user: responseUser },
      //   process.env.ACCESS_TOKEN_SECRET,
      //   {
      //     expiresIn: process.env.DEFAULT_EXPIRATION,
      //   }
      // );
      const token = await randomToken();
      await redisClient.setEx(
        `accessToken:${token}`,
        Number(process.env.DEFAULT_EXPIRATION),
        JSON.stringify(responseUser)
      );
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Email verified successfully.',
        accessToken: token,
      });
    } else {
      res.status(400).json({
        error: true,
        success: false,
        message: 'Invalid verification code.',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const sendCodeVerifiedAccount = async (req, res) => {
  const { email } = req.body;
  try {
    const existedAuthEmail = await authUserModel.findOne({
      email: email,
    });
    if (!existedAuthEmail)
      return res.status(409).json({
        error: true,
        success: false,
        message: 'Email is not existed!',
      });
    const verificationCode = generateVerificationCode();
    await authUserModel.findOneAndUpdate({
      email: email,
      verificationCode: verificationCode,
    });

    await sendVerificationEmail(email, verificationCode);
    return res.status(200).json({
      error: false,
      success: true,
      message: 'Please check email to verified your account!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const updateProfile = async (req, res) => {
  const { name, value } = req.body;
  const { user } = req.decoded;
  let updatedUser;
  try {
    if (!value) {
      return res
        .status(400)
        .json({ error: true, success: false, message: `${name} is required!` });
    }
    const [existedAuthUser, existedOauthUser] = await Promise.all([
      authUserModel.findOne({ id: user.id }).lean(),
      oauthUserModel.findOne({ id: user.id }).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found user by id: ${user.id}`,
      });
    }
    const updateOptions = { $set: { [name]: value } };
    if (existedAuthUser) {
      updatedUser = await authUserModel.findOneAndUpdate(
        { id: user.id },
        updateOptions
      );
      await updateCache(`users:${user.id}`, user);
      return res.status(200).json({
        error: false,
        success: true,
        message: `${name} updated successfully.`,
      });
    }
    if (existedOauthUser) {
      updatedUser = await oauthUserModel.findOneAndUpdate(
        { id: user.id },
        updateOptions
      );
      await updateCache(`users:${user.id}`, user);
      return res.status(200).json({
        error: false,
        success: true,
        message: `${name} updated successfully.`,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateAvatar = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  let user;
  try {
    if (!file) {
      return res
        .status(400)
        .json({ error: true, success: false, message: 'No file uploaded!' });
    }
    const [existedAuthUser, existedOauthUser] = await Promise.all([
      authUserModel.findOne({ id: id }).lean(),
      oauthUserModel.findOne({ id: id }).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({
        error: true,
        success: false,
        message: `Not found user by id: ${id}`,
      });
    }
    if (existedAuthUser) {
      user = await authUserModel.findOneAndUpdate(
        { id: id },
        {
          $set: { image: file.path },
        }
      );
      await updateCache(`users:${id}`, user);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Image updated successfully.',
      });
    }

    if (existedOauthUser) {
      user = await oauthUserModel.findOneAndUpdate(
        { id: id },
        {
          $set: { image: file.path },
        }
      );
      await updateCache(`users:${id}`, user);
      return res.status(200).json({
        error: false,
        success: true,
        message: 'Image updated successfully.',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
