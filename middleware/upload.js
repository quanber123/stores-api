import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Thư mục lưu trữ hình ảnh
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    // Đặt tên file lưu trữ
    cb(null, Date.now() + '-' + file.originalname);
  },
});

export const uploadImg = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
}).array('images');
