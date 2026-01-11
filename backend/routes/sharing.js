import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reports shared by me
router.get('/shared-by-me', authenticateToken, (req, res) => {
  try {
    const sharedReports = db
      .prepare('SELECT * FROM shared_reports WHERE owner_id = ? ORDER BY created_at DESC')
      .all(req.user.id);

    res.json({ data: sharedReports });
  } catch (error) {
    console.error('Get shared by me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports shared with me
router.get('/shared-with-me', authenticateToken, (req, res) => {
  try {
    const sharedReports = db
      .prepare('SELECT * FROM shared_reports WHERE shared_with_user_id = ?')
      .all(req.user.id);

    res.json({ data: sharedReports });
  } catch (error) {
    console.error('Get shared with me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Share report
router.post('/', authenticateToken, (req, res) => {
  try {
    // Role-based authorization
    const ownerProfile = db
      .prepare('SELECT role FROM profiles WHERE user_id = ?')
      .get(req.user.id);

    if (ownerProfile && ownerProfile.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot share reports' });
    }

    const { report_id, email } = req.body;

    if (!report_id || !email) {
      return res.status(400).json({ error: 'report_id and email are required' });
    }

    // Check report ownership
    const report = db
      .prepare('SELECT * FROM health_reports WHERE id = ? AND user_id = ?')
      .get(report_id, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    // Find target user by email
    const targetProfile = db
      .prepare('SELECT user_id FROM profiles WHERE email = ?')
      .get(email);

    const sharedWithUserId = targetProfile ? targetProfile.user_id : null;

    // Prevent duplicate sharing
    const existingShare = db
      .prepare(
        'SELECT * FROM shared_reports WHERE report_id = ? AND owner_id = ? AND shared_with_email = ?'
      )
      .get(report_id, req.user.id, email);

    if (existingShare) {
      return res.status(400).json({ error: 'Report already shared with this email' });
    }

    const id = uuidv4();

    db.prepare(
      `INSERT INTO shared_reports 
       (id, report_id, owner_id, shared_with_email, shared_with_user_id, access_type)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, report_id, req.user.id, email, sharedWithUserId, 'read');

    const sharedReport = db
      .prepare('SELECT * FROM shared_reports WHERE id = ?')
      .get(id);

    res.status(201).json({ data: sharedReport });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Revoke access
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const share = db
      .prepare('SELECT * FROM shared_reports WHERE id = ? AND owner_id = ?')
      .get(id, req.user.id);

    if (!share) {
      return res.status(404).json({ error: 'Share not found or access denied' });
    }

    db.prepare('DELETE FROM shared_reports WHERE id = ?').run(id);

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
