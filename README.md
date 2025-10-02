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

## Technology Stack

- Frontend: React.js, React Bootstrap, React Router
- Backend: Node.js, Express.js
- Database: In-memory JSON storage
- Mapping: Leaflet.js
- Additional: React Bootstrap Icons, react-leaflet

## Prerequisites

- Node.js (v14 or higher)
- npm package manager (v6 or higher)
- Modern web browser with geolocation support

## Setup Instructions

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

### Important Notes

- Make sure the backend server is running before starting the frontend
- Allow location access in your browser when prompted for location-based features
- The application uses in-memory storage, so data will be reset when the server restarts

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will start on http://localhost:5000

## Troubleshooting

### Common Issues and Solutions

1. **Backend server not starting**
   - Check if port 5000 is already in use
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

### Error Messages

- `EADDRINUSE`: Port is already in use. Kill the process using that port or change the port number in .env
- `Module not found`: Run `npm install` in both client and server directories
- `TypeError: Cannot read property 'map' of undefined`: Ensure the backend server is running and returning data

## Contributing

Feel free to submit issues and enhancement requests:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)