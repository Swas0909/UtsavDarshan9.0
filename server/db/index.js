const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const allowMock = process.env.ALLOW_MOCK_DB === 'true';

// Load pandals data from JSON
let pandalData = [];
try {
  const pandalPath = path.join(__dirname, '../data/pandals.json');
  const rawData = fs.readFileSync(pandalPath, 'utf8');
  const parsedData = JSON.parse(rawData);
  pandalData = parsedData.pandals || [];
  console.log(`[db] Loaded ${pandalData.length} pandals from JSON`);
} catch (err) {
  console.error('[db] Error loading pandals.json:', err.message);
}

// Helper: build a simple mock row object from INSERT column list and params
function buildRowFromInsert(sql, params) {
  const insertColsMatch = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)\s*VALUES/i);
  const cols = insertColsMatch ? insertColsMatch[1].split(',').map(c => c.trim()) : [];
  const row = {};
  for (let i = 0; i < cols.length; i++) {
    if (i < params.length) row[cols[i]] = params[i];
    else if (/created_at/i.test(cols[i]) || /updated_at/i.test(cols[i])) row[cols[i]] = new Date().toISOString();
    else row[cols[i]] = null;
  }
  if (!('id' in row)) row.id = Date.now();
  return row;
}

// Convert pandal data from JSON format to DB format
function convertPandalToDbFormat(p) {
  return {
    id: p.id,
    name: p.name,
    location: p.location,
    theme: p.theme,
    crowd_level: p.crowdLevel,
    crowdLevel: p.crowdLevel,
    rating: p.rating,
    lat: p.coordinates?.lat || 0,
    lng: p.coordinates?.lng || 0,
    image_url: p.imageUrl,
    imageUrl: p.imageUrl,
    description: p.description,
    visiting_hours: p.visitingHours,
    visitingHours: p.visitingHours,
    history: p.history,
    established: p.established
  };
}

// Create real pool
const pool = new Pool({
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

// Test connection once
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err.message);
    if (allowMock) {
      console.warn('ALLOW_MOCK_DB=true, falling back to in-memory mock database.');
    } else {
      console.error('Set ALLOW_MOCK_DB=true to start server without a working PostgreSQL connection.');
    }
  }
})();

// Mock DB implementation
const mockDb = {
  query: async (text, params) => {
    const t = (text || '').toString();
    const normalized = t.trim().toUpperCase();

    // No-op transaction commands
    if (normalized === 'BEGIN' || normalized === 'COMMIT' || normalized === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }

    // Handle SELECT FROM pandals
    if (/SELECT[\s\S]*FROM\s+pandals/i.test(t)) {
      let rows = pandalData.map(convertPandalToDbFormat);
      
      // Apply WHERE filters
      if (/WHERE[\s\S]*LOWER\(name\)|LOWER\(location\)|LOWER\(theme\)/i.test(t)) {
        const searchParam = params && params[0] ? params[0].toLowerCase() : '';
        if (searchParam) {
          rows = rows.filter(p => 
            p.name.toLowerCase().includes(searchParam.replace(/%/g, '')) ||
            p.location.toLowerCase().includes(searchParam.replace(/%/g, '')) ||
            p.theme.toLowerCase().includes(searchParam.replace(/%/g, ''))
          );
        }
      }
      
      if (/WHERE[\s\S]*LOWER\(location\)/i.test(t) && !(/name|theme/i.test(t))) {
        const locationParam = params && params[0] ? params[0].toLowerCase() : '';
        if (locationParam) {
          rows = rows.filter(p => p.location.toLowerCase().includes(locationParam.replace(/%/g, '')));
        }
      }
      
      if (/WHERE[\s\S]*LOWER\(theme\)\s*=/i.test(t)) {
        const themeParam = params && params[0] ? params[0].toLowerCase() : '';
        if (themeParam) {
          rows = rows.filter(p => p.theme.toLowerCase() === themeParam);
        }
      }
      
      return { rows, rowCount: rows.length };
    }

    // Handle SELECT FROM pandals WHERE id = ?
    if (/SELECT[\s\S]*FROM\s+pandals[\s\S]*WHERE[\s\S]*id\s*=/i.test(t)) {
      const id = params && params[0] ? parseInt(params[0]) : null;
      const row = pandalData.find(p => p.id === id);
      return row ? { rows: [convertPandalToDbFormat(row)], rowCount: 1 } : { rows: [], rowCount: 0 };
    }

    // Handle INSERT ... RETURNING *
    if (/INSERT\s+INTO[\s\S]*RETURNING\s+\*/i.test(t)) {
      const row = buildRowFromInsert(t, params || []);
      return { rows: [row], rowCount: 1 };
    }

    // SELECT queries: return empty set by default
    if (/^SELECT/i.test(t)) {
      return { rows: [], rowCount: 0 };
    }

    // UPDATE/DELETE: act like zero rows affected
    if (/^(UPDATE|DELETE)/i.test(t)) {
      return { rows: [], rowCount: 0 };
    }

    // Default fallback
    return { rows: [], rowCount: 0 };
  }
};

// Export a wrapper that tries real pool first, then falls back to mock if allowed
module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (allowMock) {
        return mockDb.query(text, params);
      }
      throw err;
    }
  }
};