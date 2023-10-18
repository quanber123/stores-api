import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import userModel from '../models/user.model';
const router = Router();

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
      const newTokenExpiration = process.env.TOKEN_EXPIRATION.match(/^(\d+)/);
      const token = jwt.sign(
        {
          username: findUser.username,
          password: findUser.password,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: `${process.env.TOKEN_EXPIRATION}` }
      );
      const tokenExpiration = new Date();
      tokenExpiration.setTime(
        tokenExpiration.getTime() +
          parseInt(newTokenExpiration) * 24 * 60 * 60 * 1000
      );

      return res
        .status(200)
        .json({ accessToken: token, tokenExpiration: tokenExpiration });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
