// import multer from 'multer';
// import path from 'path';

// import { allowedExtensions } from '../config/allow.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Thư mục lưu trữ hình ảnh
//     cb(null, 'public/uploads/origin');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     const filename = uniqueSuffix + '-' + file.originalname;
//     cb(null, filename);
//   },
// });
// export const uploadImg = multer({
//   storage: storage,
//   limits: { fieldSize: 25 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const fileExtension = path.extname(file.originalname).toLowerCase();
//     if (file && !allowedExtensions.includes(fileExtension)) {
//       cb(new Error('Invalid file format. Only images are allowed.'), true);
//     } else {
//       cb(null, true);
//     }
//   },
// });
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
cloudinary.config({
  cloud_name: process.env.DINARY_NAME,
  api_key: process.env.DINARY_API_KEY,
  api_secret: process.env.DINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Tên thư mục trên Cloudinary để lưu trữ ảnh
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Định dạng ảnh được chấp nhận
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const uploadImg = multer({ storage: storage });
