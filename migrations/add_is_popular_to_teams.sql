-- Migration: Add is_popular column to teams table
-- Date: 2025-11-27

-- Add is_popular column if not exists
ALTER TABLE teams 
ADD COLUMN is_popular TINYINT(1) NOT NULL DEFAULT 0;

-- Optional: Set some popular teams (uncomment and modify team IDs as needed)
-- UPDATE teams SET is_popular = 1 WHERE id IN (33, 34, 35, 40, 42, 47, 49, 50);

-- Verify the column was added
SHOW COLUMNS FROM teams LIKE 'is_popular';
