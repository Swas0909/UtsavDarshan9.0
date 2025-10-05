const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Register a new pandal (pending approval)
router.post('/register', isAuthenticated, async (req, res) => {
  console.log('Received pandal registration request:', req.body);
  
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'address', 'latitude', 'longitude', 'opening_hours', 'closing_hours'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const {
      name,
      description,
      address,
      latitude,
      longitude,
      contact_number,
      email,
      website,
      opening_hours,
      closing_hours,
      wheelchair_accessible,
      parking_available,
      food_available,
      restroom_available,
      photo_url
    } = req.body;

    // Validate coordinates
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    console.log('Inserting pandal into database...');
    
    // Start a transaction
    await db.query('BEGIN');

    try {
      const result = await db.query(
      `INSERT INTO pending_pandals (
        name, description, address, latitude, longitude,
        contact_number, email, website, opening_hours,
        closing_hours, wheelchair_accessible, parking_available,
        food_available, restroom_available, photo_url,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *`,
      [
        name, description, address, latitude, longitude,
        contact_number, email, website, opening_hours,
        closing_hours, wheelchair_accessible, parking_available,
        food_available, restroom_available, photo_url,
        'pending'
      ]
    );

      await db.query('COMMIT');
      res.json(result.rows[0]);
    } catch (dbError) {
      await db.query('ROLLBACK');
      throw dbError;
    }
  } catch (error) {
    console.error('Error registering pandal:', error);
    res.status(500).json({ error: 'Failed to register pandal. ' + error.message });
  }
});

// Get all pending pandal registrations (admin only)
router.get('/pending', isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM pending_pandals WHERE status = $1',
      ['pending']
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending pandals:', error);
    res.status(500).json({ error: 'Failed to fetch pending pandals' });
  }
});

// Approve a pandal registration (admin only)
router.post('/:id/approve', isAdmin, async (req, res) => {
  try {
    // Start a transaction
    await db.query('BEGIN');

    // Get the pending pandal
    const pendingPandal = await db.query(
      'SELECT * FROM pending_pandals WHERE id = $1',
      [req.params.id]
    );

    if (pendingPandal.rows.length === 0) {
      throw new Error('Pending pandal not found');
    }

    const pandal = pendingPandal.rows[0];

    // Insert into main pandals table
    await db.query(
      `INSERT INTO pandals (
        name, description, address, latitude, longitude,
        contact_number, email, website, opening_hours,
        closing_hours, wheelchair_accessible, parking_available,
        food_available, restroom_available, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        pandal.name, pandal.description, pandal.address,
        pandal.latitude, pandal.longitude, pandal.contact_number,
        pandal.email, pandal.website, pandal.opening_hours,
        pandal.closing_hours, pandal.wheelchair_accessible,
        pandal.parking_available, pandal.food_available,
        pandal.restroom_available, pandal.photo_url
      ]
    );

    // Update status in pending_pandals
    await db.query(
      'UPDATE pending_pandals SET status = $1 WHERE id = $2',
      ['approved', req.params.id]
    );

    // Commit transaction
    await db.query('COMMIT');

    res.json({ message: 'Pandal approved successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error approving pandal:', error);
    res.status(500).json({ error: 'Failed to approve pandal' });
  }
});

// Reject a pandal registration (admin only)
router.post('/:id/reject', isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE pending_pandals SET status = $1 WHERE id = $2 RETURNING *',
      ['rejected', req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending pandal not found' });
    }

    res.json({ message: 'Pandal registration rejected' });
  } catch (error) {
    console.error('Error rejecting pandal:', error);
    res.status(500).json({ error: 'Failed to reject pandal' });
  }
});

module.exports = router;