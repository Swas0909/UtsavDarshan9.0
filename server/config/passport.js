const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');

const pool = new Pool({
  database: "utsavdarshan",
  user: "postgres",
  password: "swas1234",
  host: "localhost",
  port: "9000"
});

const ADMIN_EMAILS = ['amolwfh20@gmail.com', 'medhajjagtap@gmail.com'];

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (existingUser.rows.length > 0) {
        return done(null, existingUser.rows[0]);
      }

      // Create new user
      const newUser = await pool.query(
        `INSERT INTO users (
          google_id, 
          email, 
          display_name, 
          profile_picture,
          is_admin
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          profile.id,
          profile.emails[0].value,
          profile.displayName,
          profile.photos[0].value,
          ADMIN_EMAILS.includes(profile.emails[0].value)
        ]
      );

      done(null, newUser.rows[0]);
    } catch (err) {
      done(err, null);
    }
  }
));