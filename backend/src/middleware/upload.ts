import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export function makeUploader(maxSizeMb = 5) {
  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only jpeg, png, or webp images are allowed"));
      }
      cb(null, true);
    },
  });
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
