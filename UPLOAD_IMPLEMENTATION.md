# File Upload Implementation Guide

## Adding Image Upload Feature to Your Pandal Registration Form

This guide will help you implement a complete file upload system.

---

## Step 1: Install Required Packages

```powershell
cd server
npm install multer
```

---

## Step 2: Create Upload Configuration

Create file: `server/config/upload.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../client/public/images/pandals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: pandal-name-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'pandal-' + uniqueSuffix + ext);
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

---

## Step 3: Update Backend Route

Update `server/routes/pandalRegistration.js`:

```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const upload = require('../config/upload');

// Register with image upload
router.post('/register', isAuthenticated, upload.single('image'), async (req, res) => {
  console.log('Received pandal registration request:', req.body);
  console.log('Uploaded file:', req.file);
  
  try {
    // Validate required fields
    const requiredFields = ['name', 'description', 'address', 'latitude', 'longitude', 'opening_hours', 'closing_hours'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: \`\${field} is required\` });
      }
    }

    const {
      name, description, address, latitude, longitude,
      contact_number, email, website, opening_hours,
      closing_hours, wheelchair_accessible, parking_available,
      food_available, restroom_available
    } = req.body;

    // Get image path
    let photo_url = req.body.photo_url; // URL from input field
    if (req.file) {
      // If file was uploaded, use that instead
      photo_url = \`/images/pandals/\${req.file.filename}\`;
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Coordinates out of range' });
    }

    await db.query('BEGIN');

    const result = await db.query(
      \`INSERT INTO pending_pandals (
        name, description, address, latitude, longitude,
        contact_number, email, website, opening_hours,
        closing_hours, wheelchair_accessible, parking_available,
        food_available, restroom_available, photo_url,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      RETURNING *\`,
      [
        name, description, address, lat, lng,
        contact_number || null, email || null, website || null,
        opening_hours, closing_hours,
        wheelchair_accessible || false, parking_available || false,
        food_available || false, restroom_available || false,
        photo_url || null, 'pending'
      ]
    );

    await db.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error registering pandal:', error);
    res.status(500).json({ message: 'Failed to register pandal: ' + error.message });
  }
});

module.exports = router;
```

---

## Step 4: Update Frontend Form

Update `client/src/components/PandalRegistrationModal.js`:

```javascript
const [formData, setFormData] = useState({
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  contact_number: '',
  email: '',
  website: '',
  opening_hours: '',
  closing_hours: '',
  wheelchair_accessible: false,
  parking_available: false,
  food_available: false,
  restroom_available: false,
  photo_url: '',
  image_file: null  // Add this for file upload
});

const [imagePreview, setImagePreview] = useState(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFormData(prev => ({ ...prev, image_file: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccess(false);
  
  // ... validation code ...

  setSubmitting(true);

  try {
    // Create FormData for file upload
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'image_file' && formData[key]) {
        formDataToSend.append('image', formData[key]);
      } else if (key !== 'image_file') {
        formDataToSend.append(key, formData[key]);
      }
    });

    const response = await fetch('http://localhost:5000/api/pandal-registration/register', {
      method: 'POST',
      credentials: 'include',
      body: formDataToSend,  // Send FormData instead of JSON
      // DON'T set Content-Type header - browser will set it automatically with boundary
    });

    // ... rest of the code ...
  } catch (error) {
    console.error('Error submitting pandal registration:', error);
    setError('An unexpected error occurred. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

// In the form JSX, add this field:
<Form.Group className="mb-3">
  <Form.Label>Upload Image</Form.Label>
  <Form.Control
    type="file"
    accept="image/*"
    onChange={handleFileChange}
  />
  <Form.Text className="text-muted">
    Or enter a URL below. Max size: 5MB. Formats: JPG, PNG, GIF, WebP
  </Form.Text>
  {imagePreview && (
    <div className="mt-2">
      <img 
        src={imagePreview} 
        alt="Preview" 
        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
      />
    </div>
  )}
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Or Photo URL</Form.Label>
  <Form.Control
    type="url"
    name="photo_url"
    value={formData.photo_url}
    onChange={handleChange}
    placeholder="https://example.com/image.jpg"
  />
  <Form.Text className="text-muted">
    Enter a direct image URL if you're not uploading a file
  </Form.Text>
</Form.Group>
```

---

## Step 5: Add Image Management for Admin

Create `server/routes/images.js`:

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { isAdmin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Upload single image
router.post('/upload', isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = \`/images/pandals/\${req.file.filename}\`;
    res.json({
      message: 'Image uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Delete image
router.delete('/:filename', isAdmin, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../../client/public/images/pandals', filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

module.exports = router;
```

Then in `server.js`:
```javascript
const imageRouter = require('./routes/images');
app.use('/api/images', imageRouter);
```

---

## Alternative: Use Cloudinary (Cloud Storage)

### Install Cloudinary SDK:
```powershell
npm install cloudinary multer-storage-cloudinary
```

### Configure in `server/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pandals',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
```

---

## Testing

1. **Start the server**: `npm start` in server folder
2. **Open the registration form**
3. **Try uploading an image**
4. **Check**: `client/public/images/pandals/` folder for the uploaded file
5. **Verify**: Database has the correct path

---

## Security Considerations

1. **Validate file types** - Only accept images
2. **Limit file size** - Prevent large uploads
3. **Sanitize filenames** - Avoid directory traversal attacks
4. **Check storage space** - Monitor disk usage
5. **Use authentication** - Only logged-in users can upload
6. **Scan for malware** - Consider virus scanning for production

---

## Production Recommendations

For production, consider:
- **AWS S3** - Scalable cloud storage
- **Cloudinary** - Image hosting with transformations
- **Azure Blob Storage** - Microsoft cloud storage
- **Google Cloud Storage** - Google cloud storage

These services handle scaling, CDN, and automatic optimization.
