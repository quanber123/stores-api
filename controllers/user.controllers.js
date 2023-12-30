import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import oauthUserModel from '../models/oauth-user.model.js';
import authUserModel from '../models/auth-user.model.js';
import { hashPassword } from '../utils/hashInfo.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';
import { allowedExtensions } from '../config/allow.js';
import notifyModel from '../models/notify.model.js';
import settingsModel from '../models/settings.model.js';

//GET User by token
export const getUserByToken = async (req, res) => {
  const { user } = req.decoded;
  const existedOauthUser = user.email
    ? await oauthUserModel.findOne({ email: user.email }).lean()
    : null;
  const existedAuthUser = user.email
    ? await authUserModel.findOne({ email: user.email }).lean()
    : null;
  try {
    const [oauthUserResult, authUserResult] = await Promise.all([
      existedOauthUser,
      existedAuthUser,
    ]);
    if (existedOauthUser || existedAuthUser) {
      return res.status(200).json({
        user: {
          _id: oauthUserResult?._id || authUserResult?._id,
          email: oauthUserResult?.email || authUserResult?.email,
          name: oauthUserResult?.name || authUserResult?.name,
          image: oauthUserResult?.image || authUserResult?.image,
          isVerified: oauthUserResult?.isVerified || authUserResult?.isVerified,
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
        name: findUser.name,
        email: findUser.email,
        password: findUser.password,
        image: findUser.image,
        isVerified: findUser.isVerified,
      };
      const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: `90d`,
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
      name: name,
      email: email,
      password: hashedPassword,
      verificationCode: verificationCode,
    });
    await user.save();
    const token = jwt.sign(
      {
        user: {
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: `90d` }
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
        user: user._id,
        notification: [...allSettingsNotify],
      });
      const user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        isVerified: user.isVerified,
      };
      const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: `90d`,
      });
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
      authUserModel.findById(id).lean(),
      oauthUserModel.findById(id).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({ message: `Not found user by id: ${id}` });
    }
    const updateOptions = { $set: { [name]: value } };
    if (existedAuthUser) {
      await authUserModel.findByIdAndUpdate(id, updateOptions);
    }
    if (existedOauthUser) {
      await oauthUserModel.findByIdAndUpdate(id, updateOptions);
    }
    return res.status(200).json({ message: `${name} updated successfully.` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateAvatar = async (req, res) => {
  const { id } = req.body;
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded!' });
    }
    const [existedAuthUser, existedOauthUser] = await Promise.all([
      authUserModel.findById(id).lean(),
      oauthUserModel.findById(id).lean(),
    ]);
    if (!existedAuthUser && !existedOauthUser) {
      return res.status(404).json({ message: `Not found user by id: ${id}` });
    }
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res
        .status(400)
        .json({ message: 'Invalid file format. Only images are allowed.' });
    }
    const updateOptions = {
      $set: { image: `http://localhost:3000/${file.path}` },
    };
    if (existedAuthUser) {
      await authUserModel.findByIdAndUpdate(id, updateOptions);
    }

    if (existedOauthUser) {
      await oauthUserModel.findByIdAndUpdate(id, updateOptions);
    }

    return res.status(200).json({ message: 'Image updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllSettings = async (req, res) => {
  const { id } = req.params;
  try {
    const existedSettings = await settingsModel.findOne({ user: id });
    if (!existedSettings)
      return res.status(404).json({ message: `Not found by user id: ${id}` });
    return res.status(200).json({ settings: existedSettings });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const toggleNotifications = async (req, res) => {
  const { id, enabled, idNotify } = req.body;
  try {
    const updatedSettings = await settingsModel.findOneAndUpdate(
      { user: id, notification: { $elemMatch: { _id: idNotify } } },
      {
        $set: { 'notification.$.enabled': !enabled, updated_at: Date.now() },
      },
      {
        new: true,
      }
    );
    if (updatedSettings)
      return res.status(200).json({ message: 'Updated Successfully!' });
    return res.status(404).json({ message: `Not found by settings id: ${id}` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
