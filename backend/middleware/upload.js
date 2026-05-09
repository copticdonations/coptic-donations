const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
}

const itemStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/items'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const photoStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/installations'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const receiptStorage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/receipts'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const limits = { fileSize: 5 * 1024 * 1024 };

const uploadItem = multer({ storage: itemStorage, fileFilter, limits });
const uploadPhoto = multer({ storage: photoStorage, fileFilter, limits });
const uploadReceipt = multer({ storage: receiptStorage, fileFilter, limits });

module.exports = { uploadItem, uploadPhoto, uploadReceipt };
