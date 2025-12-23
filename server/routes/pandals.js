const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Get all pandals with filters
router.get('/', async (req, res) => {
  try {
    const { search, location, theme, distance, lat, lng, sortBy } = req.query;
    let query = `
      SELECT id, name, location, theme, crowd_level as "crowdLevel", 
             rating, lat, lng, image_url as "imageUrl", description,
             visiting_hours as "visitingHours", history, established
      FROM pandals
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        LOWER(name) LIKE $${paramCount} OR 
        LOWER(location) LIKE $${paramCount} OR 
        LOWER(theme) LIKE $${paramCount}
      )`;
      values.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    if (location) {
      query += ` AND LOWER(location) LIKE $${paramCount}`;
      values.push(`%${location.toLowerCase()}%`);
      paramCount++;
    }

    if (theme) {
      query += ` AND LOWER(theme) = $${paramCount}`;
      values.push(theme.toLowerCase());
      paramCount++;
    }

    const result = await db.query(query, values);
    let pandals = result.rows.map(p => ({
      ...p,
      coordinates: {
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng)
      }
    }));

    if (distance && lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxDistance = parseFloat(distance);

      pandals = pandals.filter(p => {
        const d = calculateDistance(
          userLat,
          userLng,
          p.coordinates.lat,
          p.coordinates.lng
        );
        return d <= maxDistance;
      });

      if (sortBy === 'distance') {
        pandals.sort((a, b) => {
          const distA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng);
          const distB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng);
          return distA - distB;
        });
      }
    }

    res.json(pandals);
  } catch (err) {
    console.error('Error fetching pandals:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pandal by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, location, theme, crowd_level as "crowdLevel", 
              rating, lat, lng, image_url as "imageUrl", description,
              visiting_hours as "visitingHours", history, established
       FROM pandals 
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pandal not found' });
    }

    const pandal = {
      ...result.rows[0],
      coordinates: {
        lat: parseFloat(result.rows[0].lat),
        lng: parseFloat(result.rows[0].lng)
      }
    };
    res.json(pandal);
  } catch (err) {
    console.error('Error fetching pandal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get favorite status
router.get('/:id/favorite', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Please login first' });
  }

  try {
    const result = await db.query(
      `SELECT * FROM favorites WHERE user_id = $1 AND pandal_id = $2`,
      [req.user.id, req.params.id]
    );
    res.json({ isFavorite: result.rows.length > 0 });
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle favorite status
router.post('/:id/favorite', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Please login first' });
  }

  try {
    const { action } = req.body;
    
    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "add" or "remove"' });
    }

    const pandalExists = await db.query(
      'SELECT id FROM pandals WHERE id = $1',
      [req.params.id]
    );

    if (pandalExists.rows.length === 0) {
      return res.status(404).json({ error: 'Pandal not found' });
    }

    let result;
    if (action === 'add') {
      result = await db.query(
        `INSERT INTO favorites (user_id, pandal_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, pandal_id) DO NOTHING
         RETURNING *`,
        [req.user.id, req.params.id]
      );
    } else {
      result = await db.query(
        `DELETE FROM favorites 
         WHERE user_id = $1 AND pandal_id = $2
         RETURNING *`,
        [req.user.id, req.params.id]
      );
    }

    res.json({ 
      success: true, 
      action,
      favorite: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating favorite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Please login first' });
  }

  try {
    const { rating, review } = req.body;
    const result = await db.query(
      `INSERT INTO reviews (pandal_id, user_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, req.user.id, rating, review]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.display_name, u.profile_picture
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.pandal_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
