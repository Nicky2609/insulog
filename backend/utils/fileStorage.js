import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer keeps the uploaded file in memory (never written to the server's
// own disk). This matters once deployed: most cloud hosts (Render, etc.)
// wipe the local filesystem on every restart or redeploy, so anything
// saved to disk there would eventually disappear. The file is forwarded
// straight to Cloudinary instead, where it persists independently of the
// backend server's own lifecycle.
// Only raster image types. SVG is deliberately excluded: it can embed
// <script>/onload JS and would be stored/served back as if it were a plain
// image, which is a stored-XSS vector.
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

export function imageFileFilter(req, file, cb) {
  const isAllowed = ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype);
  cb(isAllowed ? null : new Error('Solo se permiten imagenes (png, jpg, webp, gif)'), isAllowed);
}

export function createUploader(limitsMb = 20) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: limitsMb * 1024 * 1024 },
    fileFilter: imageFileFilter,
  });
}

// Uploads a file buffer to Cloudinary under insulog/<subfolder>/ and
// returns the public HTTPS URL to store in MongoDB.
export function uploadToCloudinary(buffer, subfolder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `insulog/${subfolder}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
