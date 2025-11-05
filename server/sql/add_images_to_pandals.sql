-- SQL Script to Add Images to Existing Pandals
-- Run this in your PostgreSQL database

-- First, check current pandals and their image status
SELECT id, name, image_url FROM pandals ORDER BY id;

-- Add images to existing pandals using local paths
-- Update these based on your actual pandal names and available images

-- Example: Update specific pandals with local images
UPDATE pandals 
SET image_url = '/images/pandals/lalbaugcha-raja.jpg' 
WHERE name ILIKE '%lalbaugcha%raja%';

UPDATE pandals 
SET image_url = '/images/pandals/mumbaicha-raja.jpg' 
WHERE name ILIKE '%mumbaicha%raja%';

UPDATE pandals 
SET image_url = '/images/pandals/gsb-seva-mandal.jpg' 
WHERE name ILIKE '%gsb%seva%';

UPDATE pandals 
SET image_url = '/images/pandals/khetwadi-ganraj.jpg' 
WHERE name ILIKE '%khetwadi%ganraj%';

UPDATE pandals 
SET image_url = '/images/pandals/andhericha-raja.jpg' 
WHERE name ILIKE '%andheri%';

UPDATE pandals 
SET image_url = '/images/pandals/chinchpokli-chintamani.jpg' 
WHERE name ILIKE '%chinchpokli%chintamani%';

-- OR: Use external URLs (Imgur example)
-- UPDATE pandals 
-- SET image_url = 'https://i.imgur.com/YOUR_IMAGE_ID.jpg' 
-- WHERE id = 1;

-- Add a default placeholder for pandals without images
UPDATE pandals 
SET image_url = '/images/placeholder.jpg' 
WHERE image_url IS NULL OR image_url = '';

-- Verify the updates
SELECT id, name, image_url FROM pandals ORDER BY id;

-- Check which pandals still need images
SELECT id, name FROM pandals 
WHERE image_url IS NULL OR image_url = '' OR image_url = '/images/placeholder.jpg';
