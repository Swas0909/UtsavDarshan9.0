require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
require('./config/passport');
const pandalsData = require('./data/pandalsData');

const app = express();

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

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

// No database connection needed

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



// API Routes
app.get('/api/pandals', async (req, res) => {
  try {
    const { search, location, theme, distance, lat, lng, sortBy } = req.query;
    let pandals = pandalsData.pandals.map(p => ({
      id: p.id,
      name: p.name,
      location: p.location,
      theme: p.theme,
      crowdLevel: p.crowdLevel,
      rating: p.rating,
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      imageUrl: p.imageUrl,
      description: p.description,
      visitingHours: p.visitingHours,
      history: p.history,
      established: p.established,
      coordinates: p.coordinates
    }));

    if (search) {
      pandals = pandals.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.theme.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (location) {
      pandals = pandals.filter(p => p.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (theme) {
      pandals = pandals.filter(p => p.theme.toLowerCase() === theme.toLowerCase());
    }

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
    const pandal = pandalsData.pandals.find(p => p.id == req.params.id);
    if (!pandal) {
      return res.status(404).json({ error: 'Pandal not found' });
    }

    res.json({
      id: pandal.id,
      name: pandal.name,
      location: pandal.location,
      theme: pandal.theme,
      crowdLevel: pandal.crowdLevel,
      rating: pandal.rating,
      lat: pandal.coordinates.lat,
      lng: pandal.coordinates.lng,
      imageUrl: pandal.imageUrl,
      description: pandal.description,
      visitingHours: pandal.visitingHours,
      history: pandal.history,
      established: pandal.established,
      coordinates: pandal.coordinates
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for a pandal
app.get('/api/pandals/:id/reviews', async (req, res) => {
  try {
    res.json([]);
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
    const selectedPandals = pandalsData.pandals.filter(p => pandals.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      location: p.location,
      lat: p.coordinates.lat,
      lng: p.coordinates.lng,
      coordinates: p.coordinates
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