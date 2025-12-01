import { uploadImageService } from "./upload.service.js";

export const uploadImageController = async (req, res) => {
  try {
    // Kiểm tra file có được upload không
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Không có file được upload",
      });
    }

    const tempFile = req.file.path;
    const url = await uploadImageService(tempFile);
    
    return res.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Upload thất bại",
    });
  }
};
