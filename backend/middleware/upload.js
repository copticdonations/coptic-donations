const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_RECEIPT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];

function fileFilter(req, file, cb) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
}

function receiptFileFilter(req, file, cb) {
  if (ALLOWED_RECEIPT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Accepted formats: JPEG, PNG, WebP, or PDF.'), false);
  }
}

// UPLOADS_PATH env var points to a persistent volume on Railway.
// Default falls back to local uploads/ for local dev.
const baseUploadPath = process.env.UPLOADS_PATH || path.join(__dirname, '../uploads');

function makeStorage(subdir) {
  const dest = path.join(baseUploadPath, subdir);
  fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: dest,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
  });
}

const limits = { fileSize: 5 * 1024 * 1024 };

const uploadItem    = multer({ storage: makeStorage('items'),         fileFilter,        limits });
const uploadPhoto   = multer({ storage: makeStorage('installations'), fileFilter,        limits });
const uploadReceipt = multer({ storage: makeStorage('receipts'),      receiptFileFilter, limits });

module.exports = { uploadItem, uploadPhoto, uploadReceipt, baseUploadPath };
