import multer from 'multer';
import path from 'path';

import { allowedExtensions } from '../config/allow.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Thư mục lưu trữ hình ảnh
    cb(null, 'public/uploads/origin');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + '-' + file.originalname;
    cb(null, filename);
  },
});

export const uploadImg = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      cb(new Error('Invalid file format. Only images are allowed.'), false);
    } else {
      cb(null, true);
    }
  },
}).single('image');
