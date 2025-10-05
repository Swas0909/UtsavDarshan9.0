const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const ADMIN_EMAILS = ['amolwfh20@gmail.com', 'medhajjagtap@gmail.com'];

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // For demo, return a mock user
  done(null, {
    id: id,
    google_id: id,
    email: 'guest@example.com',
    display_name: 'Guest User',
    profile_picture: '',
    is_admin: false
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      google_id: profile.id,
      email: profile.emails[0].value,
      display_name: profile.displayName,
      profile_picture: profile.photos[0].value,
      is_admin: ADMIN_EMAILS.includes(profile.emails[0].value)
    };
    done(null, user);
  }
));
