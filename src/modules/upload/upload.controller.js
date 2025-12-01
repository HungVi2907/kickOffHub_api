import { uploadImageService } from "./upload.service.js";

export const uploadImageController = async (req, res) => {
  try {
    const tempFile = req.file.path;
    const url = await uploadImageService(tempFile);
    return res.json({
      success: true,
      url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
