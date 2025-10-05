const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// Get user's favorite pandals
router.get('/favorites', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.* FROM pandals p
       INNER JOIN favorites f ON f.pandal_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add pandal to favorites
router.post('/favorites/:pandalId', isAuthenticated, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO favorites (user_id, pandal_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.pandalId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove pandal from favorites
router.delete('/favorites/:pandalId', isAuthenticated, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND pandal_id = $2',
      [req.user.id, req.params.pandalId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if a pandal is favorited by the user
router.get('/favorites/check/:pandalId', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id = $1 AND pandal_id = $2)',
      [req.user.id, req.params.pandalId]
    );
    res.json({ isFavorited: result.rows[0].exists });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;