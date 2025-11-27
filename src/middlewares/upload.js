import multer from 'multer'
import fs from 'fs'
import path from 'path'

const uploadsRoot = path.join(process.cwd(), 'uploads')
const postUploadsDir = path.join(uploadsRoot, 'posts')

function ensureUploadDirs() {
  if (!fs.existsSync(postUploadsDir)) {
    fs.mkdirSync(postUploadsDir, { recursive: true })
  }
}

ensureUploadDirs()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postUploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const uploader = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Định dạng ảnh không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.'))
  },
})

export function buildPublicImagePath(filename) {
  if (!filename) return null
  return `/uploads/posts/${filename}`
}

export function handlePostImageUpload(req, res, next) {
  uploader.single('image')(req, res, (err) => {
    if (err) {
      const message = err.message || 'Không thể tải ảnh lên'
      res.status(400).json({ error: message })
      return
    }
    next()
  })
}
