CREATE TABLE pandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    theme VARCHAR(100),
    crowd_level VARCHAR(50),
    rating DECIMAL(3,2),
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);