import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    const userDir = path.join(uploadDir, req.user.id);

    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files and PDFs are allowed'));
    }
  },
});

// Get all reports for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const { report_type, startDate, endDate, searchQuery } = req.query;
    let query = 'SELECT * FROM health_reports WHERE user_id = ?';
    const params = [req.user.id];

    if (report_type && report_type !== 'all') {
      query += ' AND report_type = ?';
      params.push(report_type);
    }

    if (startDate) {
      query += ' AND report_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND report_date <= ?';
      params.push(endDate);
    }

    if (searchQuery) {
      query += ' AND title LIKE ?';
      params.push(`%${searchQuery}%`);
    }

    query += ' ORDER BY report_date DESC';

    const reports = db.prepare(query).all(...params);

    res.json({ data: reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get shared reports
router.get('/shared', authenticateToken, (req, res) => {
  try {
    // Get report IDs shared with current user
    const sharedIds = db
      .prepare('SELECT report_id FROM shared_reports WHERE shared_with_user_id = ?')
      .all(req.user.id)
      .map((row) => row.report_id);

    if (sharedIds.length === 0) {
      return res.json({ data: [] });
    }

    // Get the actual reports
    const placeholders = sharedIds.map(() => '?').join(',');
    const reports = db
      .prepare(`SELECT * FROM health_reports WHERE id IN (${placeholders}) ORDER BY report_date DESC`)
      .all(...sharedIds);

    res.json({ data: reports });
  } catch (error) {
    console.error('Get shared reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload report
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  try {
    // Role-based authorization: viewers cannot upload reports
    const profile = db.prepare('SELECT role FROM profiles WHERE user_id = ?').get(req.user.id);
    if (profile && profile.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot upload reports' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const { title, report_type, report_date, notes } = req.body;

    if (!title || !report_type || !report_date) {
      return res.status(400).json({ error: 'Title, report_type, and report_date are required' });
    }

    const id = uuidv4();
    const filePath = path.join(req.user.id, req.file.filename);
    const fileSize = req.file.size;

    db.prepare(
      'INSERT INTO health_reports (id, user_id, title, report_type, report_date, file_path, file_name, file_size, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      req.user.id,
      title,
      report_type,
      report_date,
      filePath,
      req.file.originalname,
      fileSize,
      notes || null
    );

    const report = db.prepare('SELECT * FROM health_reports WHERE id = ?').get(id);

    res.status(201).json({ data: report });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Download report
router.get('/download/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Get report - check if user owns it or if it's shared with them
    const report = db.prepare('SELECT * FROM health_reports WHERE id = ?').get(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check ownership or shared access
    const isOwner = report.user_id === req.user.id;
    const isShared = db
      .prepare(
        'SELECT 1 FROM shared_reports WHERE report_id = ? AND shared_with_user_id = ?'
      )
      .get(id, req.user.id);

    if (!isOwner && !isShared) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, report.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(report.file_name)}"`);
    res.download(filePath, report.file_name);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    // Role-based authorization: viewers cannot delete reports
    const profile = db.prepare('SELECT role FROM profiles WHERE user_id = ?').get(req.user.id);
    if (profile && profile.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot delete reports' });
    }

    const { id } = req.params;

    // Check if report exists and belongs to user
    const report = db
      .prepare('SELECT * FROM health_reports WHERE id = ? AND user_id = ?')
      .get(id, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete file
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, report.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database (cascade will delete shared_reports entries)
    db.prepare('DELETE FROM health_reports WHERE id = ?').run(id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

