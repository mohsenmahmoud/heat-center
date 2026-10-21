import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { uploadsRepo } from '../db.js';
import { errors } from '../lib/errors.js';
import { uploadItem } from '../services/visuals.js';

const TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: config.paths.uploads,
    filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + TYPES[file.mimetype]),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (TYPES[file.mimetype]) return cb(null, true);
    cb(errors.validation(`Unsupported file type ${file.mimetype}`, 'نوع الملف غير مدعوم. المسموح: صور PNG/JPG/WEBP أو صوت MP3/WAV/M4A.'));
  },
});

const VIDEO_TYPES = { 'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm' };

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: config.paths.uploads,
    filename: (_req, file, cb) => cb(null, crypto.randomBytes(16).toString('hex') + VIDEO_TYPES[file.mimetype]),
  }),
  limits: { fileSize: 200 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (VIDEO_TYPES[file.mimetype]) return cb(null, true);
    cb(errors.validation(`Unsupported video type ${file.mimetype}`, 'نوع الفيديو غير مدعوم. المسموح: MP4 أو MOV أو WEBM.'));
  },
});

export const uploadsRouter = Router();

// Reference videos (up to 200 MB) for "make a video like this one".
uploadsRouter.post('/video', videoUpload.single('file'), (req, res, next) => {
  if (!req.file) return next(errors.validation('No video received', 'لم يتم استلام الفيديو.'));
  const f = req.file;
  const row = uploadsRepo.add({ originalName: f.originalname, fileName: f.filename, mime: f.mimetype, size: f.size });
  res.status(201).json({ id: row.id, name: f.originalname, mime: f.mimetype, size: f.size, url: `/uploads/${f.filename}` });
});

uploadsRouter.post('/', upload.array('files', 10), (req, res, next) => {
  if (!req.files?.length) return next(errors.validation('No files received', 'لم يتم استلام أي ملف.'));
  const items = req.files.map((f) => {
    const row = uploadsRepo.add({ originalName: f.originalname, fileName: f.filename, mime: f.mimetype, size: f.size });
    return uploadItem(row, { source: 'user' });
  });
  res.status(201).json({ items });
});
