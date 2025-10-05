-- Add user_id column and foreign key
ALTER TABLE pending_pandals 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS theme VARCHAR(100);

-- Update created_at and updated_at columns to use timestamptz if they don't already
ALTER TABLE pending_pandals 
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE,
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pending_pandals_updated_at ON pending_pandals;

CREATE TRIGGER update_pending_pandals_updated_at
    BEFORE UPDATE ON pending_pandals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();