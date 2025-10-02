require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});