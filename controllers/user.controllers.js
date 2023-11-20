import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/user.model.js';
const oAuth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage'
);

//GET User by token

export const getUserByToken = async (req, res) => {
  const { username } = req.user;
  try {
    const existedUser = await userModel.findOne({ username: username });
    if (!existedUser) {
      return res.stats(404).json({ message: `Not found user ${username}` });
    } else {
      return res.status(200).json({
        user: {
          username: existedUser.username,
          name: existedUser.name,
          imageSrc: existedUser.image,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//User Login
export const userLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ messages: 'Username and Password are required!' });
  }
  try {
    const findUser = new userModel.findOne({ username: username });
    if (!findUser) return res.sendStatus(401);
    const match = await bcrypt.compare(password, findUser.password);
    if (match) {
      // const newTokenExpiration = process.env.TOKEN_EXPIRATION.match(/^(\d+)/);
      const token = jwt.sign(
        {
          username: findUser.username,
          password: findUser.password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        // { expiresIn: `${process.env.TOKEN_EXPIRATION}` }
        { expiresIn: `90d` }
      );
      return res.status(200).json({ accessToken: token });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// User Register

export const userRegister = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ messages: 'Username and Password are required!' });
  const duplicate = await userModel.findOne({ username: username });
  if (duplicate)
    return res.status(409).json({ messages: 'Username already exists!' });
  try {
    const hashPwd = await bcrypt.hash(password, 10);
    const user = {
      username: username,
      password: hashPwd,
    };
    const newUser = new userModel(user);
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login by google

export const googleLogin = async (req, res) => {
  try {
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const findUser = await userModel.findOne({ username: payload.email });
    if (!findUser) {
      const user = {
        id: payload.sub,
        username: payload.email,
        name: payload.name,
        image: payload.picture,
        oauthProvider: 'Google',
      };
      const newUser = new userModel(user);
      const saveUser = await newUser.save();
      const token = jwt.sign(
        { username: saveUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `90d` }
      );
      return res.json({
        accessToken: token,
        admin: {
          username: saveUser.username,
          name: saveUser.name,
          imageSrc: saveUser.image,
        },
      });
    } else {
      const token = jwt.sign(
        {
          username: findUser.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `90d` }
      );
      return res.json({
        accessToken: token,
        user: {
          username: findUser.username,
          name: findUser.name,
          imageSrc: findUser.image,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
