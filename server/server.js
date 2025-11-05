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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session({
  secret: 'utsavdarshan-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  proxy: true
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

// Test database connection and check tables
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Database connected successfully');
  
  // Check if tables exist
  pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'favorites'
    );
  `, (err, res) => {
    if (err) {
      console.error('Error checking favorites table:', err);
    } else {
      console.log('Favorites table exists:', res.rows[0].exists);
      if (!res.rows[0].exists) {
        console.log('Creating favorites table...');
        pool.query(`
          CREATE TABLE favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            pandal_id INTEGER NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, pandal_id)
          );
        `, (err, res) => {
          if (err) {
            console.error('Error creating favorites table:', err);
          } else {
            console.log('Favorites table created successfully');
          }
        });
      }
    }
  });
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
  (req, res, next) => {
    console.log('Starting Google authentication...');
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }
);

app.get('/auth/google/callback',
  (req, res, next) => {
    console.log('Received Google callback...');
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect('http://localhost:3001/login?error=' + encodeURIComponent('Authentication failed'));
      }
      if (!user) {
        console.error('No user returned from Google');
        return res.redirect('http://localhost:3001/login?error=' + encodeURIComponent('Authentication failed'));
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.redirect('http://localhost:3001/login?error=' + encodeURIComponent('Login failed'));
        }
        console.log('User logged in successfully:', user.id);
        return res.redirect('http://localhost:3001');
      });
    })(req, res, next);
  }
);

app.get('/api/current-user', (req, res) => {
  res.json(req.user || null);
});

// Get user's favorite pandals
app.get('/api/user/favorites', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.location, p.theme, p.crowd_level as "crowdLevel",
              p.rating, p.lat, p.lng, p.image_url as "imageUrl", p.description,
              p.visiting_hours as "visitingHours", p.history, p.established,
              f.created_at as "favoritedAt"
       FROM pandals p
       INNER JOIN favorites f ON p.id = f.pandal_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    const pandals = result.rows.map(p => ({
      ...p,
      coordinates: {
        lat: parseFloat(p.lat),
        lng: parseFloat(p.lng)
      }
    }));

    res.json(pandals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Update pandal image (admin only)
app.put('/api/admin/pandals/:id/image', isAdmin, async (req, res) => {
  try {
    const { image_url } = req.body;
    const { id } = req.params;

    if (!image_url) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const result = await pool.query(
      `UPDATE pandals SET image_url = $1 WHERE id = $2 RETURNING *`,
      [image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pandal not found' });
    }

    res.json({ message: 'Image updated successfully', pandal: result.rows[0] });
  } catch (err) {
    console.error('Error updating image:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ensure database table exists
async function ensureTablesExist() {
  try {
    // First check if the users table exists
    const usersTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );
    `);

    if (!usersTableExists.rows[0].exists) {
      console.error('Users table does not exist! Please create users table first.');
      process.exit(1);
    }

    // Create favorites table with proper error handling
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          pandal_id INTEGER NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, pandal_id)
        )
      `);
      console.log('Favorites table verified successfully');
    } catch (err) {
      console.error('Error creating favorites table:', err);
      throw err;
    }

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

    // Map fields to existing pandals schema
    const visitingHours = `${pandal.opening_hours || '06:00'} - ${pandal.closing_hours || '23:00'}`;

    const inserted = await pool.query(
      `INSERT INTO pandals (
        name, location, theme, lat, lng, rating, description,
        image_url, visiting_hours, crowd_level
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id, name`
      ,[
        pandal.name,
        pandal.address,
        'Community',
        pandal.latitude,
        pandal.longitude,
        4.0,
        pandal.description,
        pandal.photo_url,
        visitingHours,
        'Medium'
      ]
    );

    // Update status in pending_pandals
    await pool.query(
      'UPDATE pending_pandals SET status = $1 WHERE id = $2',
      ['approved', req.params.id]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.json({ message: 'Pandal approved successfully', pandal: inserted.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error approving pandal:', error);
    res.status(500).json({ error: 'Failed to approve pandal: ' + (error.message || 'Unknown error') });
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

// Mount route handlers
const pandalRegistrationRouter = require('./routes/pandalRegistration');
const favoritesRouter = require('./routes/favorites');

app.use('/api/pandal-registration', pandalRegistrationRouter);
app.use('/api/user', favoritesRouter);

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

// Get favorite status for a pandal
app.get('/api/pandals/:id/favorite', isAuthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM favorites WHERE user_id = $1 AND pandal_id = $2`,
      [req.user.id, req.params.id]
    );
    res.json({ isFavorite: result.rows.length > 0 });
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

// Toggle favorite status for a pandal
app.post('/api/pandals/:id/favorite', isAuthenticated, async (req, res) => {
  console.log('Received favorite toggle request:', {
    userId: req.user?.id,
    pandalId: req.params.id,
    action: req.body.action
  });

  try {
    const { action } = req.body; // 'add' or 'remove'
    
    if (!action) {
      console.error('No action specified in request body');
      return res.status(400).json({ error: 'Action must be specified (add or remove)' });
    }

    if (!req.user?.id) {
      console.error('No user ID found in request');
      return res.status(401).json({ error: 'User ID not found' });
    }

    // Verify pandal exists first
    const pandalExists = await pool.query(
      'SELECT id FROM pandals WHERE id = $1',
      [req.params.id]
    );

    if (pandalExists.rows.length === 0) {
      console.error('Pandal not found:', req.params.id);
      return res.status(404).json({ error: 'Pandal not found' });
    }

    let result;
    if (action === 'add') {
      console.log('Adding favorite');
      result = await pool.query(
        `INSERT INTO favorites (user_id, pandal_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, pandal_id) DO NOTHING
         RETURNING *`,
        [req.user.id, req.params.id]
      );

      // If no row was returned due to ON CONFLICT DO NOTHING
      if (result.rows.length === 0) {
        // Check if it's already favorited
        const existing = await pool.query(
          `SELECT * FROM favorites WHERE user_id = $1 AND pandal_id = $2`,
          [req.user.id, req.params.id]
        );
        if (existing.rows.length > 0) {
          console.log('Pandal was already favorited');
          return res.json({ success: true, action: 'add', alreadyExists: true });
        }
      }

    } else if (action === 'remove') {
      console.log('Removing favorite');
      result = await pool.query(
        `DELETE FROM favorites 
         WHERE user_id = $1 AND pandal_id = $2
         RETURNING *`,
        [req.user.id, req.params.id]
      );
      
      if (result.rows.length === 0) {
        console.log('No favorite found to remove');
        return res.json({ success: true, action: 'remove', nothingToRemove: true });
      }
    } else {
      console.error('Invalid action:', action);
      return res.status(400).json({ error: 'Invalid action. Must be "add" or "remove"' });
    }

    console.log('Successfully updated favorite status:', {
      action,
      result: result.rows[0]
    });

    res.json({ 
      success: true, 
      action, 
      userId: req.user.id, 
      pandalId: req.params.id,
      favorite: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating favorite:', err);
    // Send more detailed error information in development
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      code: err.code // Include the PostgreSQL error code if available
    });
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