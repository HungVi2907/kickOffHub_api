import express from "express";
import multer from "multer";
import { uploadImageController } from "./upload.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), uploadImageController);

export default router;
