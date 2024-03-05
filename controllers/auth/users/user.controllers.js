import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import oauthUserModel from '../../../models/auth/users/oauth-user.model.js';
import authUserModel from '../../../models/auth/users/auth-user.model.js';
import { hashPassword } from '../../../utils/hashInfo.js';
import { generateVerificationCode } from '../../../utils/generateVerificationCode.js';
import { sendVerificationEmail } from '../../../utils/sendVerificationEmail.js';
import notifyModel from '../../../models/auth/users/notify.model.js';
import settingsModel from '../../../models/auth/users/settings.model.js';
import { checkCache } from '../../../modules/cache.js';
import { redisClient } from '../../../config/redis.js';
import { optimizedImg } from '../../../middleware/optimizedImg.js';

//GET User by token
export const getUserByToken = async (req, res) => {
  const { user } = req.decoded;
  try {
    const getUser = await checkCache(`users:${user.id}`, async () => {
      const existedOauthUser = user.id
        ? await oauthUserModel.findOne({ id: user.id }).lean()
        : null;
      const existedAuthUser = user.email
        ? await authUserModel.findOne({ id: user.id }).lean()
        : null;
      const [oauthUserResult, authUserResult] = await Promise.all([
        existedOauthUser,
        existedAuthUser,
      ]);
      return {
        user: {
          _id: oauthUserResult?._id || authUserResult?._id,
          id: oauthUserResult?.id || authUserResult?.id,
          email: oauthUserResult?.email || authUserResult?.email,
          name: oauthUserResult?.name || authUserResult?.name,
          image: oauthUserResult?.image || authUserResult?.image,
          isVerified: oauthUserResult?.isVerified || authUserResult?.isVerified,
        },
      };
    });
    if (getUser !== null) {
      return res.status(200).json(getUser);
    } else {
      return res.status(404).json({ message: `Not found user ${user.email}` });
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
      .json({ message: 'Username and Password are required!' });
  }
  try {
    const findUser = await authUserModel.findOne({ email: email }).lean();
    if (!findUser)
      return res.status(404).json({ message: 'Account not register!' });
    const match = await bcrypt.compare(password, findUser.password);
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
      const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.DEFAULT_EXPIRATION,
      });
      return res.status(200).json({
        accessToken: token,
        user: user,
      });
    } else {
      return res.status(403).json({ message: 'Password is not incorrect!' });
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
      return res.status(409).json({ message: 'Email already existed!' });
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
    sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      message: 'Please check your email to verified account!',
      user: {
        _id: user._id,
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
      const token = jwt.sign(
        { user: responseUser },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: process.env.DEFAULT_EXPIRATION,
        }
      );
      return res.status(200).json({
        message: 'Email verified successfully.',
        user: user,
        accessToken: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid verification code.' });
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
      return res.status(409).json({ message: 'Email is not existed!' });
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
export const updateProfile = async (req, res) => {
  const { id, name, value } = req.body;
  try {
    if (!value) {
      return res.status(400).json({ message: `${name} is required!` });
    }
    const [existedAuthUser, existedOauthUser] = await Promise.all([
      authUserModel.findOne({ id: id }).lean(),
      oauthUserModel.findOne({ id: id }).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({ message: `Not found user by id: ${id}` });
    }
    const updateOptions = { $set: { [name]: value } };
    if (existedAuthUser) {
      await authUserModel.findOneAndUpdate({ id: id }, updateOptions);
    }
    if (existedOauthUser) {
      await oauthUserModel.findOneAndUpdate({ id: id }, updateOptions);
    }
    return res.status(200).json({ message: `${name} updated successfully.` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateAvatar = async (req, res) => {
  const { id } = req.params;
  const file = req.file;
  let updateOptions;
  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
    const [existedAuthUser, existedOauthUser] = await Promise.all([
      authUserModel.findOne({ id: id }).lean(),
      oauthUserModel.findOne({ id: id }).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({ message: `Not found user by id: ${id}` });
    }
    const optimized = await optimizedImg(file, 100, 80);
    if (optimized) {
      updateOptions = {
        $set: {
          image: `${process.env.APP_URL}/${optimized}`,
        },
      };
    } else {
      updateOptions = {
        $set: { image: `${process.env.APP_URL}/${file.path}` },
      };
    }
    if (existedAuthUser) {
      await authUserModel.findOneAndUpdate({ id: id }, updateOptions);
    }

    if (existedOauthUser) {
      await oauthUserModel.findOneAndUpdate({ id: id }, updateOptions);
    }

    return res.status(200).json({ message: 'Image updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllSettings = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await checkCache(`settings:${id}`, async () => {
      const existedSettings = await settingsModel.findOne({ user: id }).lean();
      if (existedSettings) {
        await redisClient.set(
          `settings:${id}`,
          JSON.stringify(existedSettings)
        );
        return existedSettings;
      } else {
        return null;
      }
    });
    return res.status(200).json({ settings: data !== null ? data : {} });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const toggleNotifications = async (req, res) => {
  const { id, enabled, idNotify } = req.body;
  try {
    const updatedSettings = await settingsModel.findOneAndUpdate(
      { user: id, notifications: { $elemMatch: { _id: idNotify } } },
      {
        $set: { 'notifications.$.enabled': !enabled, updated_at: Date.now() },
      },
      {
        new: true,
      }
    );
    if (updatedSettings) {
      await redisClient.set(`settings:${id}`, JSON.stringify(updatedSettings));
      return res.status(200).json({ message: 'Updated Successfully!' });
    }
    return res.status(404).json({ message: `Updated Failed!` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
