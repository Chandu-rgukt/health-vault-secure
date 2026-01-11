import express from 'express';
import db from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get profile
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile by email (for sharing)
router.get('/email/:email', authenticateToken, (req, res) => {
  try {
    const { email } = req.params;

    const profile = db.prepare('SELECT user_id, email FROM profiles WHERE email = ?').get(email);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: profile });
  } catch (error) {
    console.error('Get profile by email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only update their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { full_name, avatar_url } = req.body;

    const updateFields = [];
    const values = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      values.push(full_name);
    }
    if (avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      values.push(avatar_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    db.prepare(
      `UPDATE profiles SET ${updateFields.join(', ')} WHERE user_id = ?`
    ).run(...values);

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);

    res.json({ data: profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

