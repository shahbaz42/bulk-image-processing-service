import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import sanitize from 'sanitize-filename';
import fs from 'fs';

if (!fs.existsSync('src/uploads')) {
  fs.mkdirSync('src/uploads');
}

// Configure multer with filename option to retain the original file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    // Sanitize the original filename
    const originalName = sanitize(file.originalname).replace(/ /g, '_');

    // Generate a unique filename with a secure random value
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    
    // Get the file extension
    const ext = path.extname(originalName);

    // Save the file with the sanitized name + secure random suffix + extension
    cb(null, `${path.basename(originalName, ext)}-${uniqueSuffix}${ext}`);
  }
});

export const upload = multer({ storage });
export { csvValidatorConfig } from "./csvValidatorConfig";