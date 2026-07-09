const path = require('path');
const multer = require('multer');

const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.gif', '.txt'];

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/plain'
];

/** Are we running on Vercel serverless (no persistent filesystem)? */
const isServerless = !!process.env.VERCEL;

if (isServerless) {
  console.warn('[upload] Serverless environment detected — using memory storage. ' +
    'Uploaded files will NOT persist. Configure cloud storage (S3, Cloudinary, etc.) for production.');
}

/**
 * Create storage engine compatible with the runtime.
 * - Disk storage for local development
 * - Memory storage for Vercel serverless (files exist only for the duration of the request)
 */
function createStorage(folder) {
  if (isServerless) {
    return multer.memoryStorage();
  }
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, path.join(__dirname, '..', 'uploads', folder));
    },
    filename(req, file, cb) {
      const safeOriginalName = file.originalname.replace(/\s+/g, '-').toLowerCase();
      cb(null, `${Date.now()}-${safeOriginalName}`);
    }
  });
}

/**
 * Get the stored file identifier from a Multer-enhanced request object.
 * - Local disk storage returns the relative file path.
 * - Memory storage returns the original filename (no persistent path available).
 */
function getStoredFilePath(file) {
  if (!file) return null;
  if (file.path) {
    return path.relative(path.join(__dirname, '..'), file.path).replace(/\\/g, '/');
  }
  // Memory storage fallback — store original name only
  return `uploads/memory/${file.originalname}`;
}

function fileFilter(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type.'));
  }

  return cb(null, true);
}

const uploadMaterial = multer({
  storage: createStorage('materials'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadSubmission = multer({
  storage: createStorage('submissions'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadMaterial,
  uploadSubmission,
  getStoredFilePath
};
