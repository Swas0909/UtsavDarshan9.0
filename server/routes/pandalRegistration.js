const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Register a new pandal (pending approval)
router.post('/register', isAuthenticated, async (req, res) => {
  console.log('Received pandal registration request:', req.body);
  console.log('User:', req.user);
  
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'address', 'latitude', 'longitude', 'opening_hours', 'closing_hours'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        console.log(`Missing required field: ${field}`);
        return res.status(400).json({ message: `${field} is required` });
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
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.log('Invalid coordinates - not numbers:', { latitude, longitude });
      return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
    }

    if (lat < -90 || lat > 90) {
      console.log('Invalid latitude - out of range:', lat);
      return res.status(400).json({ message: 'Latitude must be between -90 and 90' });
    }

    if (lng < -180 || lng > 180) {
      console.log('Invalid longitude - out of range:', lng);
      return res.status(400).json({ message: 'Longitude must be between -180 and 180' });
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
        name, description, address, lat, lng,
        contact_number || null, email || null, website || null, opening_hours,
        closing_hours, wheelchair_accessible || false, parking_available || false,
        food_available || false, restroom_available || false, photo_url || null,
        'pending'
      ]
    );

      await db.query('COMMIT');
      console.log('Successfully registered pandal:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (dbError) {
      await db.query('ROLLBACK');
      console.error('Database error:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error registering pandal:', error);
    res.status(500).json({ message: 'Failed to register pandal: ' + error.message });
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
    console.log('Approving pandal ID:', req.params.id);
    
    // Start a transaction
    await db.query('BEGIN');

    // Get the pending pandal
    const pendingPandal = await db.query(
      'SELECT * FROM pending_pandals WHERE id = $1',
      [req.params.id]
    );

    if (pendingPandal.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Pending pandal not found' });
    }

    const pandal = pendingPandal.rows[0];
    console.log('Retrieved pending pandal:', pandal);

    // Map pending_pandals fields to main pandals table fields
    // pending_pandals: address, latitude, longitude -> pandals: location, lat, lng
    // Create visiting_hours from opening_hours and closing_hours
    const visitingHours = `${pandal.opening_hours || '6 AM'} - ${pandal.closing_hours || '11 PM'}`;
    
    // Insert into main pandals table with correct field mapping
    const insertResult = await db.query(
      `INSERT INTO pandals (
        name, location, theme, lat, lng, rating, description,
        image_url, visiting_hours, crowd_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        pandal.name,
        pandal.address,                    // address -> location
        'Community',                        // default theme
        pandal.latitude,                    // latitude -> lat
        pandal.longitude,                   // longitude -> lng
        4.0,                               // default rating
        pandal.description,
        pandal.photo_url,                  // photo_url -> image_url
        visitingHours,
        'Medium'                           // default crowd_level
      ]
    );

    console.log('Inserted into pandals table:', insertResult.rows[0]);

    // Update status in pending_pandals
    await db.query(
      'UPDATE pending_pandals SET status = $1, updated_at = NOW() WHERE id = $2',
      ['approved', req.params.id]
    );

    // Commit transaction
    await db.query('COMMIT');

    console.log('Pandal approved successfully');
    res.json({ 
      message: 'Pandal approved successfully',
      pandal: insertResult.rows[0]
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error approving pandal:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to approve pandal: ' + error.message });
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