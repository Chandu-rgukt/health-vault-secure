import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all vitals for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const { vital_type, startDate, endDate } = req.query;
    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.user.id];

    if (vital_type && vital_type !== 'all') {
      query += ' AND vital_type = ?';
      params.push(vital_type);
    }

    if (startDate) {
      query += ' AND recorded_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND recorded_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY recorded_at DESC';

    const vitals = db.prepare(query).all(...params);

    res.json({ data: vitals });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create vital
router.post('/', authenticateToken, (req, res) => {
  try {
    // Role-based authorization: viewers cannot record vitals
    const profile = db.prepare('SELECT role FROM profiles WHERE user_id = ?').get(req.user.id);
    if (profile && profile.role === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot record vitals' });
    }

    const { vital_type, value, unit, recorded_at, notes } = req.body;

    if (!vital_type || value === undefined || !unit) {
      return res.status(400).json({ error: 'vital_type, value, and unit are required' });
    }

    const id = uuidv4();
    const recordedAt = recorded_at || new Date().toISOString();

    db.prepare(
      'INSERT INTO vitals (id, user_id, vital_type, value, unit, recorded_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, req.user.id, vital_type, value, unit, recordedAt, notes || null);

    const vital = db.prepare('SELECT * FROM vitals WHERE id = ?').get(id);

    res.status(201).json({ data: vital });
  } catch (error) {
    console.error('Create vital error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vital
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    // Check if vital exists and belongs to user
    const vital = db.prepare('SELECT * FROM vitals WHERE id = ? AND user_id = ?').get(id, req.user.id);

    if (!vital) {
      return res.status(404).json({ error: 'Vital not found' });
    }

    db.prepare('DELETE FROM vitals WHERE id = ?').run(id);

    res.json({ message: 'Vital deleted successfully' });
  } catch (error) {
    console.error('Delete vital error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

