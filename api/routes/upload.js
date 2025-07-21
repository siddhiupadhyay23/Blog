// routes/upload.js - Simple local file upload
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(path.dirname(path.dirname(__dirname)), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage first (more reliable)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
    }
  },
});

router.post('/', verifyToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(req.file.originalname) || '.jpg';
    const filename = 'image-' + uniqueSuffix + fileExtension;
    const filepath = path.join(uploadsDir, filename);
    
    // Write the file from buffer to disk
    fs.writeFileSync(filepath, req.file.buffer);
    
    const fileUrl = `/uploads/${filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      url: fileUrl,
      downloadURL: fileUrl,
      filename: filename,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed'
    });
  }
});

export default router;