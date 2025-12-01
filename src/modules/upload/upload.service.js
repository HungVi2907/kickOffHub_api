import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const uploadImageService = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: process.env.CLOUDINARY_FOLDER || "kickoffhub/posts",
      resource_type: "image",
    });
    
    // Xóa file tạm sau khi upload thành công
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Không thể xóa file tạm:", err.message);
    });
    
    return result.secure_url;
  } catch (error) {
    // Xóa file tạm nếu upload thất bại
    fs.unlink(filePath, () => {});
    throw error;
  }
};
