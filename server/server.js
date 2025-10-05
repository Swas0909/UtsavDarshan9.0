require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'utsavdarshan-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Please log in first' });
};

const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Please log in first' });
  }
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'This action requires admin privileges' });
  }
  return next();
};

// Database connection
const pool = new Pool({
  database: "utsavdarshan",
  user: "postgres",
  password: "swas1234",
  host: "localhost",
  port: "9000"
});

// Helper function to calculate distance between coordinates
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

// Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3001/login',
    successRedirect: 'http://localhost:3001'
  })
);

app.get('/api/current-user', (req, res) => {
  res.json(req.user || null);
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Admin Routes
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/pandals', isAdmin, async (req, res) => {
  try {
    const { name, location, theme, lat, lng, description } = req.body;
    const result = await pool.query(
      `INSERT INTO pandals (name, location, theme, lat, lng, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, location, theme, lat, lng, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure database table exists
async function ensureTablesExist() {
  try {
    // Create feedback table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_pandals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        contact_number VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        opening_hours TIME,
        closing_hours TIME,
        wheelchair_accessible BOOLEAN DEFAULT false,
        parking_available BOOLEAN DEFAULT false,
        food_available BOOLEAN DEFAULT false,
        restroom_available BOOLEAN DEFAULT false,
        photo_url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables verified');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

ensureTablesExist();

// Pandal Registration Routes
app.post('/api/pandals/register', isAuthenticated, async (req, res) => {
  try {
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

    // Insert into pending_pandals table
    const result = await pool.query(
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error registering pandal:', error);
    res.status(500).json({ error: 'Failed to register pandal' });
  }
});

// Get pending pandals (admin only)
app.get('/api/pandals/pending', isAdmin, async (req, res) => {
  try {
    console.log('Fetching pending pandals...');
    console.log('User:', req.user);
    const result = await pool.query(
      'SELECT * FROM pending_pandals WHERE status = $1',
      ['pending']
    );
    console.log('Found pending pandals:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending pandals:', error);
    res.status(500).json({ error: 'Failed to fetch pending pandals: ' + error.message });
  }
});

// Approve a pandal (admin only)
app.post('/api/pandals/:id/approve', isAdmin, async (req, res) => {
  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Get the pending pandal
    const pendingPandal = await pool.query(
      'SELECT * FROM pending_pandals WHERE id = $1',
      [req.params.id]
    );

    if (pendingPandal.rows.length === 0) {
      throw new Error('Pending pandal not found');
    }

    const pandal = pendingPandal.rows[0];

    // Insert into main pandals table
    await pool.query(
      `INSERT INTO pandals (
        name, description, location, lat, lng,
        contact_number, email, website, visiting_hours,
        wheelchair_accessible, parking_available,
        food_available, restroom_available, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        pandal.name, pandal.description, pandal.address,
        pandal.latitude, pandal.longitude, pandal.contact_number,
        pandal.email, pandal.website, 
        `${pandal.opening_hours} - ${pandal.closing_hours}`,
        pandal.wheelchair_accessible, pandal.parking_available,
        pandal.food_available, pandal.restroom_available,
        pandal.photo_url
      ]
    );

    // Update status in pending_pandals
    await pool.query(
      'UPDATE pending_pandals SET status = $1 WHERE id = $2',
      ['approved', req.params.id]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Pandal approved successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error approving pandal:', error);
    res.status(500).json({ error: 'Failed to approve pandal' });
  }
});

// Reject a pandal (admin only)
app.post('/api/pandals/:id/reject', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
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

// API Routes
app.get('/api/pandals', async (req, res) => {
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

    const result = await pool.query(query, values);
    let pandals = result.rows.map(p => ({
      ...p,
      coordinates: {
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng)
      }
    }));

    // Handle distance filtering and sorting in memory since it requires complex calculations
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pandal by ID
app.get('/api/pandals/:id', async (req, res) => {
  try {
    const result = await pool.query(
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
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for a pandal
app.get('/api/pandals/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE pandal_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a review
app.post('/api/pandals/:id/reviews', async (req, res) => {
  try {
    const { userId, rating, review } = req.body;
    const result = await pool.query(
      `INSERT INTO reviews (pandal_id, user_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, userId, rating, review]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { email, message } = req.body;
    const result = await pool.query(
      `INSERT INTO feedbacks (email, message)
       VALUES ($1, $2)
       RETURNING *`,
      [email, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedbacks (admin only)
app.get('/api/admin/feedbacks', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM feedbacks 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// Route optimization endpoint
app.post('/api/route-plan', async (req, res) => {
  try {
    const { pandals, startPoint } = req.body;
    const result = await pool.query(
      `SELECT id, name, location, lat, lng 
       FROM pandals 
       WHERE id = ANY($1)`,
      [pandals]
    );
    
    const selectedPandals = result.rows.map(p => ({
      ...p,
      coordinates: {
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng)
      }
    }));

    // Simple route optimization using nearest neighbor algorithm
    const route = [];
    let current = startPoint;
    const unvisited = [...selectedPandals];

    while (unvisited.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;
      
      unvisited.forEach((pandal, idx) => {
        const distance = calculateDistance(
          current.lat,
          current.lng,
          pandal.coordinates.lat,
          pandal.coordinates.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = idx;
        }
      });

      const nearest = unvisited.splice(nearestIdx, 1)[0];
      route.push({
        pandal: nearest,
        distance: minDistance
      });
      current = nearest.coordinates;
    }

    res.json({
      route,
      totalDistance: route.reduce((sum, r) => sum + r.distance, 0),
      estimatedTime: route.length * 30 // Assuming 30 minutes per pandal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});