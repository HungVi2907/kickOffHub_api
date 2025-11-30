import multer from 'multer';
import ValidationException from './exceptions/ValidationException.js';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.'));
  },
});

export function handlePostImageUpload(req, res, next) {
  uploader.single('image')(req, res, (err) => {
    if (err) {
      const message = err.message || 'Không thể tải ảnh lên';
      next(new ValidationException(message, 'INVALID_IMAGE_FORMAT'));
      return;
    }
    next();
  });
}

export default uploader;
