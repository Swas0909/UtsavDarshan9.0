# Image Management Guide for Utsav Darshan

## Current Image Setup

Your website currently supports images in three ways:

### 1. **Local Images (Recommended for Development)**
Place images in: `client/public/images/pandals/`

**Usage in Database:**
```
/images/pandals/lalbaugcha-raja.jpg
```

**Existing Images:**
- andhericha-raja.jpg
- chinchpokli-chintamani.jpg
- gsb-seva-mandal.jpg
- khetwadi-ganraj.jpg
- lalbaugcha-raja.jpg
- mumbaicha-raja.jpg

---

### 2. **External Image URLs**
Use direct URLs from image hosting services.

**Popular Free Image Hosting Options:**
- **Imgur** (https://imgur.com) - Free, no account needed
- **Cloudinary** (https://cloudinary.com) - Free tier available
- **ImgBB** (https://imgbb.com) - Free, simple upload

**Example URLs:**
```
https://i.imgur.com/abc123.jpg
https://res.cloudinary.com/your-cloud/image/upload/v123/pandal.jpg
```

---

### 3. **File Upload System (Advanced)**
For uploading images directly through the admin panel.

---

## How to Add Images

### Method 1: Add Local Images (Simple)

1. **Get your image file** (JPG, PNG, or WebP format recommended)
2. **Resize the image** (recommended: 800x600 pixels for optimal loading)
3. **Rename the file** (e.g., `my-pandal-name.jpg`)
4. **Copy to folder**: `client/public/images/pandals/`
5. **Update database** with path: `/images/pandals/my-pandal-name.jpg`

### Method 2: Use External URLs

1. **Upload image** to Imgur or other hosting service
2. **Get direct image URL** (must end in .jpg, .png, etc.)
3. **Update database** with full URL: `https://i.imgur.com/abc123.jpg`

### Method 3: Update via Admin Panel

Use the pandal registration form and enter:
- **Photo URL field**: Enter either local path or external URL

---

## Database Updates

### Update Existing Pandals with Images

Connect to your PostgreSQL database and run:

```sql
-- Example: Update a specific pandal
UPDATE pandals 
SET image_url = '/images/pandals/lalbaugcha-raja.jpg' 
WHERE name = 'Lalbaugcha Raja';

-- Update multiple pandals at once
UPDATE pandals SET image_url = '/images/pandals/andhericha-raja.jpg' WHERE name LIKE '%Andheri%';
UPDATE pandals SET image_url = '/images/pandals/mumbaicha-raja.jpg' WHERE name LIKE '%Mumbai%';
```

### Check Current Images

```sql
SELECT id, name, image_url FROM pandals;
```

---

## Image Best Practices

### Recommended Image Specifications:
- **Format**: JPG (for photos), PNG (for graphics with transparency)
- **Size**: 800x600 pixels (4:3 ratio)
- **File Size**: Under 500KB for fast loading
- **Orientation**: Landscape preferred

### Image Optimization Tools:
- **TinyPNG** (https://tinypng.com) - Compress images
- **Squoosh** (https://squoosh.app) - Resize and compress
- **GIMP** (Free) or **Photoshop** (Paid) - Advanced editing

---

## Fallback System

The website automatically handles missing images:

```javascript
// In PandalGrid.js and PandalDetail.js
src={pandal.imageUrl || '/images/placeholder.jpg'}
```

**To add a placeholder image:**
1. Create or download a placeholder image
2. Save as: `client/public/images/placeholder.jpg`
3. Recommended: 800x600 generic "No Image Available" graphic

---

## Quick Start Examples

### Example 1: Upload to Imgur
1. Go to https://imgur.com/upload
2. Upload your pandal image
3. Right-click the uploaded image → "Copy image address"
4. Use URL like: `https://i.imgur.com/abc123.jpg`

### Example 2: Local File
1. Save image as `gsb-seva-mandal.jpg`
2. Copy to `client/public/images/pandals/`
3. Database value: `/images/pandals/gsb-seva-mandal.jpg`

### Example 3: Cloudinary (More Professional)
1. Sign up at https://cloudinary.com
2. Upload images to your media library
3. Copy the URL
4. Use in database

---

## Troubleshooting

### Image Not Showing?
1. **Check the URL** - Does it work in a new browser tab?
2. **Check spelling** - Is the filename exactly correct?
3. **Check format** - Is it .jpg, .png, or .webp?
4. **Check CORS** - External URLs must allow cross-origin requests
5. **Check database** - Is `image_url` column populated?

### Images Too Large?
- Compress using TinyPNG
- Resize to 800x600 or smaller
- Convert to JPG if it's PNG

### Images Loading Slowly?
- Reduce file size (target: under 200KB)
- Use WebP format for better compression
- Consider a CDN for external images

---

## Advanced: File Upload Feature

To implement file uploads (recommended for production), you'll need:
1. Multer (Node.js file upload middleware)
2. Image storage (local server or cloud like AWS S3)
3. Form with file input
4. Upload endpoint in backend

See `UPLOAD_IMPLEMENTATION.md` for detailed instructions.
