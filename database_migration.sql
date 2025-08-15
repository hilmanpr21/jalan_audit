-- Migration script to update the reports table structure
-- Execute these queries in order in your Supabase SQL editor

-- Step 1: Rename the existing category column to subcategory first
ALTER TABLE reports 
RENAME COLUMN category TO subcategory;

-- Step 2: Drop the old constraint FIRST (before changing data type)
-- The constraint name remains "reports_category_check" even after column rename
ALTER TABLE reports 
DROP CONSTRAINT reports_category_check;

-- Step 3: Modify the subcategory column to allow NULL values (for optional selection)
-- and change it to allow multiple values using TEXT[] array
ALTER TABLE reports 
ALTER COLUMN subcategory DROP NOT NULL,
ALTER COLUMN subcategory TYPE TEXT[] USING CASE 
    WHEN subcategory IS NOT NULL THEN ARRAY[subcategory] 
    ELSE NULL 
END,
ALTER COLUMN subcategory SET DEFAULT NULL;

-- Step 4: Add constraint for subcategory array (allowing NULL or valid values)
-- Prevents empty arrays - ensures data is either NULL or has meaningful values
ALTER TABLE reports 
ADD CONSTRAINT reports_subcategory_check 
CHECK (
    subcategory IS NULL OR 
    (subcategory <@ ARRAY['safety', 'accessibility', 'walkability'] AND array_length(subcategory, 1) > 0)
);

-- Step 5: Add the new category column (NOT NULL, must have at least one value)
ALTER TABLE reports 
ADD COLUMN category TEXT[] NOT NULL DEFAULT ARRAY['physical environment'];

-- Step 6: Add constraint for category (must have at least one value, no specific value restrictions)
ALTER TABLE reports 
ADD CONSTRAINT reports_category_not_empty_check 
CHECK (array_length(category, 1) > 0);

-- Optional: If you want to set default values for existing data
-- UPDATE reports 
-- SET category = ARRAY['physical environment'] 
-- WHERE category IS NULL;

-- Verify the table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'reports' 
-- ORDER BY ordinal_position;
