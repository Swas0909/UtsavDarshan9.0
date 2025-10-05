-- Create pending_pandals table
CREATE TABLE pending_pandals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  contact_number VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  opening_hours TIME NOT NULL,
  closing_hours TIME NOT NULL,
  wheelchair_accessible BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  food_available BOOLEAN DEFAULT false,
  restroom_available BOOLEAN DEFAULT false,
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);