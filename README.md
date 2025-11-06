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

## Architecture and App Routing

High level:

- Client (React) talks to the API server at http://localhost:5000
- Maps and markers are rendered with react-leaflet (OpenStreetMap tiles)
- Authentication uses Google OAuth (Passport) with an Express session cookie
- State is kept client-side in React; data is fetched via REST endpoints

Client routes (React Router):

- `/` Home (hero + about + features + featured pandals)
- `/explore` ExplorePanel (search, filters, pagination, grid)
- `/pandal/:id` PandalDetail (full details + reviews)
- `/plan-route` RoutePlanner (favorites integration + optimized route)
- `/login` Login (Google OAuth entry)
- `/admin` Admin dashboard (pending approvals) – guards on `user.is_admin`

Key API routes (Express):

- `GET /api/pandals` – list all pandals
- `GET /api/pandal/:id` – get one pandal
- `POST /api/route-plan` – build optimized route (see algorithm below)
- `GET /api/pandal-registration/pending` – fetch pending submissions (admin)
- `POST /api/pandal-registration/:id/approve` – approve and move to main table
- `GET /api/current-user` – current authenticated user
- `GET /api/user/favorites` – list user favorites

## Database model (PostgreSQL)

Main tables (selected columns):

- `pandals(id, name, location, lat, lng, theme, rating, image_url, created_at, …)`
- `pending_pandals(id, name, address, latitude, longitude, photo_url, …)`
- `favorites(id, user_id, pandal_id, created_at)`
- `users(id, google_id, name, email, is_admin, created_at)`

Data integrity and deduplication:

- Unique index prevents duplicate names (case/space insensitive):
   `CREATE UNIQUE INDEX uniq_pandals_name_norm ON pandals (LOWER(TRIM(name)));`
- Admin approval maps `pending_pandals` columns to `pandals` correctly:
   - address → location, latitude → lat, longitude → lng, photo_url → image_url

## Route planning mechanics

Endpoint: `POST /api/route-plan`

Input JSON:

```json
{
   "pandals": [1, 2, 3],
   "startPoint": { "lat": 19.0760, "lng": 72.8777 }
}
```

Output JSON (abridged):

```json
{
   "route": [
      { "pandal": { "id": 2, "name": "…", "coordinates": {"lat":…, "lng":…} }, "distance": 1.49 },
      …
   ],
   "totalDistance": 15.7,
   "estimatedTime": 150
}
```

Server-side algorithm:

- Distance: Haversine formula (accurate great-circle distance in km)
- Heuristic: Nearest Neighbor (greedy)
   - Start at the provided `startPoint`
   - Iteratively pick the closest unvisited pandal
   - Complexity: O(n²) for n stops – fast for small/medium lists
- Estimates: 30 minutes per pandal visit → `estimatedTime = n × 30`

Edge cases handled:

- Missing or invalid coordinates → 400/500 error
- Empty selection or missing start → 400 with a helpful message (client also guards)
- Mixed data types (string lat/lng) are parsed to floats

Potential upgrades (drop-in ideas):

- 2‑opt / 3‑opt improvement over greedy
- OSRM/GraphHopper-based real road travel time distances
- Time windows and crowd-aware scheduling

## Search and filter optimization (Explore)

Core techniques used in `ExplorePanel` and `PandalGrid`:

- Distance computation memoized via `useCallback(calculateDistance, [])`
- Debounced text search to reduce re-renders while typing
- Derived lists (filtered/sorted/paginated) computed once per input change
- Lightweight client-side index fields (e.g., area derived from `location`)
- Pagination to cap render cost; page size adjustable
- Cheap comparisons first (strings/tags) before geospatial filters

Filters supported:

- Text search (name/location)
- Area (derived from the first token of `location`)
- Theme, rating threshold, favorites-only
- Distance from user location (if permission granted)
- Crowd level sort (low → high)

## Admin approval workflow

1. Users submit a pandal → stored in `pending_pandals`
2. Admin visits `/admin` → sees pending list
3. Approve → row inserted into `pandals` with field mapping and sensible defaults
4. Reject → pending row removed

Important fixes baked-in:

- Correct field mapping between `pending_pandals` and `pandals`
- Unique normalized name index avoids accidental duplicates

## Favorites and authentication

- Google OAuth via Passport; session cookie persisted to the browser
- Favorites available at `GET /api/user/favorites` for logged-in users
- Route Planner toggle "Show My Favorites" and one-click "Add All Favorites"

## Local development (Windows / PowerShell)

Open two terminals:

```powershell
# Terminal 1 (API server)
cd server
npm install
npm start

# Terminal 2 (React client)
cd client
npm install
npm start
```

Environment variables:

```env
# server/.env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/utsavdarshan
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret

# client/.env
PORT=3001
REACT_APP_API_URL=http://localhost:5000
```

## Useful scripts (server/scripts)

- `find_duplicate_pandals.js` – reports duplicates by normalized name
- `delete_duplicate_pandals.js` – keeps the lowest id per name
- `approve_one_pending.js` / `print_one_pending.js` – approval flow checks
- `test_route_optimization.js` – prints a sample optimized route end-to-end

## FAQ (quick answers)

- “Why do I see duplicate cards?” → A unique normalized-name index prevents this; run the duplicate cleanup scripts if needed.
- “How are routes calculated?” → Nearest Neighbor over Haversine distances, starting from your location.
- “Can I prioritize low-crowd pandals?” → Use the explore filters or the crowd sort; the planner can be extended to honor this.
- “Why is my map blank?” → Check internet/ad-block; OpenStreetMap tiles are loaded from `https://{s}.tile.openstreetmap.org`.


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