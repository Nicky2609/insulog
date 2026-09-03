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
export function createUploader(limitsMb = 20) {
  return multer({ storage: multer.memoryStorage(), limits: { fileSize: limitsMb * 1024 * 1024 } });
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
