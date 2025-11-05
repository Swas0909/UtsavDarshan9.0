# UtsavDarshan - Ganpati Pandal Mapping Website

UtsavDarshan is a web application that helps users discover and navigate Ganpati Pandals across Mumbai during Ganesh Chaturthi. The application provides an interactive map interface, detailed information about pandals, and features for user engagement.

## Features

- 🗺️ Interactive map showing all Ganpati Pandals
- 🔍 Search and filter pandals by location, theme, and crowd levels
- 📍 Find pandals near your current location using geolocation
- ⭐ User reviews and ratings system
- 🛣️ Route planning to visit multiple pandals efficiently
- 📱 Responsive design for mobile and desktop
- 🎨 Different pandal themes (Traditional, Eco-Friendly, Modern)
- 👥 Crowd level indicators
- ⏰ Visiting hours and best time recommendations
- 🖼️ **NEW!** Image management system for pandal photos
- 👤 User authentication with Google OAuth
- ❤️ Favorites system for logged-in users
- 📝 Pandal registration with admin approval workflow

## 🖼️ Image Management

**Your website now has full image support!** See the guides below:

- 🚀 **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - 3-minute quick start
- 📖 **[QUICK_START_IMAGES.md](QUICK_START_IMAGES.md)** - Step-by-step image guide
- 📚 **[IMAGES_GUIDE.md](IMAGES_GUIDE.md)** - Complete documentation
- 🔧 **[UPLOAD_IMPLEMENTATION.md](UPLOAD_IMPLEMENTATION.md)** - File upload feature
- 🛠️ **[image-url-helper.html](image-url-helper.html)** - Interactive tool to test image URLs

**Quick Start:**
1. Open `image-url-helper.html` in your browser
2. Upload images to Imgur or use local files
3. Update database with image URLs
4. Refresh your website - images appear!

## Technology Stack

- **Frontend**: React.js, React Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Passport.js with Google OAuth
- **Mapping**: Leaflet.js
- **Additional**: React Bootstrap Icons, react-leaflet

## Prerequisites

- Node.js (v14 or higher)
- npm package manager (v6 or higher)
- PostgreSQL (v12 or higher)
- Modern web browser with geolocation support
- Google OAuth credentials (for authentication)

## Setup Instructions

### Database Setup

1. Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE utsavdarshan;
   ```

2. Run the schema:
   ```bash
   psql -U postgres -d utsavdarshan -f server/db/schema.sql
   ```

3. Run migrations:
   ```bash
   psql -U postgres -d utsavdarshan -f server/db/migrations/create_favorites_table.sql
   psql -U postgres -d utsavdarshan -f server/db/migrations/create_pending_pandals_table.sql
   ```

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env` file):
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/utsavdarshan
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will start on http://localhost:5000

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   PORT=3001
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will open in your browser at http://localhost:3001

### Adding Images to Pandals

See **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for the fastest way to add images!

Quick method:
1. Upload image to https://imgur.com/upload
2. Copy image URL
3. Update database:
   ```sql
   UPDATE pandals SET image_url = 'YOUR_IMAGE_URL' WHERE id = 1;
   ```

Or use local images:
1. Copy image to `client/public/images/pandals/`
2. Update database:
   ```sql
   UPDATE pandals SET image_url = '/images/pandals/your-image.jpg' WHERE id = 1;
   ```

## Important Notes

- Make sure PostgreSQL is running before starting the backend
- Allow location access in your browser when prompted for location-based features
- The application requires Google OAuth credentials for authentication
- Images are already supported - just add image URLs to the database!

## Troubleshooting

### Common Issues and Solutions

1. **Backend server not starting**
   - Check if port 5000 is already in use
   - Ensure PostgreSQL is running
   - Verify database credentials in .env
   - Ensure all dependencies are installed
   - Try deleting node_modules and running `npm install` again

2. **Frontend not connecting to backend**
   - Verify backend server is running on port 5000
   - Check .env file configuration
   - Clear browser cache and reload

3. **Location features not working**
   - Enable location services in your browser
   - Accept the location permission prompt
   - Try using a different browser if issues persist

4. **Maps not loading**
   - Check your internet connection
   - Ensure no ad-blockers are preventing map tiles from loading
   - Clear browser cache

5. **Images not showing**
   - Check image URL is correct in database
   - Test URL directly in browser
   - See **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** for troubleshooting
   - Use `image-url-helper.html` to test image URLs

6. **Authentication issues**
   - Verify Google OAuth credentials are correct
   - Check callback URL matches your Google Console settings
   - Ensure session secret is configured

### Error Messages

- `EADDRINUSE`: Port is already in use. Kill the process using that port or change the port number in .env
- `Module not found`: Run `npm install` in both client and server directories
- `Connection refused`: PostgreSQL is not running or connection details are incorrect
- `Authentication failed`: Check Google OAuth credentials
- `Image not found`: Check image path/URL in database (see image guides)

## 📚 Documentation

- **README.md** (this file) - Project overview and setup
- **QUICK_REFERENCE.md** - Quick commands and tips
- **QUICK_START_IMAGES.md** - Image setup guide
- **IMAGES_GUIDE.md** - Complete image documentation
- **UPLOAD_IMPLEMENTATION.md** - File upload feature guide
- **IMAGE_SYSTEM_SUMMARY.md** - Technical overview

## Contributing

Feel free to submit issues and enhancement requests:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)