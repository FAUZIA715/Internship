const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─── Configure Cloudinary ─────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Configure Cloudinary Storage ────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const documentType = req.body.documentType || 'document';
    const candidateId = req.user?.id || 'unknown';
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: `bgv_system/${candidateId}`,
      public_id: `${documentType}_${Date.now()}`,
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
    };
  }
});

// ─── File filter ──────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

module.exports = { upload, cloudinary };
