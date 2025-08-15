# Database Migration Guide: Reports Table Restructuring

## Overview

This document explains the database migration process for restructuring the `reports` table in our Jalan Audit application. The migration transforms the table from having a single-selection category system to a more flexible dual-category system with multiple selection capabilities.

## Migration Objectives

1.  **Rename existing category to subcategory**: Make the current category system optional and support multiple selections
2.  **Add new category system**: Introduce a main category system that's required and flexible for future development
3.  **Maintain data integrity**: Preserve existing data while updating the structure
4.  **Support multiple selections**: Allow users to select multiple options in both category systems

## Original Table Structure

``` sql
CREATE TABLE reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('safety', 'accessibility', 'walkability')),
  description TEXT NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Target Table Structure

``` sql
CREATE TABLE reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subcategory TEXT[] DEFAULT NULL, -- Optional, multiple selections allowed
  category TEXT[] NOT NULL,        -- Required, multiple selections allowed, no value restrictions
  description TEXT NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Steps Explained

### Step 1: Rename Column

``` sql
ALTER TABLE reports 
RENAME COLUMN category TO subcategory;
```

**Purpose**: Rename the existing `category` column to `subcategory` to avoid naming conflicts when adding the new `category` column.

**Why this order matters**: We must rename first before adding a new column with the same name, otherwise we'd have two columns named `category`.

### Step 2: Convert Column Type and Allow NULL

``` sql
ALTER TABLE reports 
ALTER COLUMN subcategory DROP NOT NULL,
ALTER COLUMN subcategory TYPE TEXT[] USING CASE 
    WHEN subcategory IS NOT NULL THEN ARRAY[subcategory] 
    ELSE NULL 
END,
ALTER COLUMN subcategory SET DEFAULT NULL;
```

**Purpose**: This step performs three critical operations:

1.  **Drop NOT NULL constraint**: Makes subcategory optional (users can submit without selecting subcategories)
2.  **Convert data type**: Changes from `VARCHAR(20)` to `TEXT[]` (array) to support multiple selections
3.  **Data conversion**: The `USING CASE` clause converts existing data:
    -   `'safety'` → `['safety']` (single string becomes single-element array)
    -   `NULL` → `NULL` (preserves null values)

**Why the CASE statement is needed**: PostgreSQL can't automatically convert string values to arrays. Without this, existing data like `'safety'` wouldn't know how to become `['safety']`.

### Step 3: Drop Old Constraint

``` sql
ALTER TABLE reports 
DROP CONSTRAINT reports_subcategory_check;
```

**Purpose**: Remove the old constraint that only allowed specific string values (`'safety'`, `'accessibility'`, `'walkability'`), since we need to create a new constraint that works with arrays.

**Note**: PostgreSQL automatically names constraints, so we use the renamed constraint name.

### Step 4: Add New Array Constraint

``` sql
ALTER TABLE reports 
ADD CONSTRAINT reports_subcategory_check 
CHECK (
    subcategory IS NULL OR 
    (subcategory <@ ARRAY['safety', 'accessibility', 'walkability'] AND array_length(subcategory, 1) > 0)
);
```

**Purpose**: Create validation rules for future data insertions: - `subcategory IS NULL`: Allows empty/no selection - `subcategory <@ ARRAY[...]`: Ensures all values in the array are from allowed list - `array_length(subcategory, 1) > 0`: Prevents empty arrays (if not NULL, must have at least one value)

**PostgreSQL Array Containment Operator (`<@`)**: The `<@` operator checks if the left array is "contained by" the right array, meaning all elements in the left array must exist in the right array.

Examples:

``` sql
['safety'] <@ ['safety', 'accessibility', 'walkability']           -- TRUE
['safety', 'accessibility'] <@ ['safety', 'accessibility', 'walkability'] -- TRUE
['invalid'] <@ ['safety', 'accessibility', 'walkability']          -- FALSE
['safety', 'invalid'] <@ ['safety', 'accessibility', 'walkability'] -- FALSE
```

This ensures that users can only submit subcategories that are in our predefined list, whether they select one or multiple values.

**Why both NULL check and array length check are necessary**:

1.  **Array vs NULL distinction**: In PostgreSQL, there's a difference between:

    -   `NULL` (no array at all)
    -   `[]` (empty array - not NULL, but has zero elements)

2.  **Empty arrays without constraint**: Even after `DROP NOT NULL`, someone could still insert empty arrays:

    ``` sql
    INSERT INTO reports (subcategory, ...) VALUES (ARRAY[]::TEXT[], ...);  -- Empty array
    INSERT INTO reports (subcategory, ...) VALUES ('{}', ...);              -- Empty array
    ```

3.  **NULL handling in constraints**: The `subcategory IS NULL` clause is required because:

    -   `DROP NOT NULL` only removes the database requirement to have a value
    -   CHECK constraints need explicit NULL handling
    -   Without `subcategory IS NULL OR`, the constraint `subcategory <@ ARRAY[...]` would return NULL for NULL values
    -   CHECK constraints require TRUE to pass, so NULL results would be rejected

4.  **Data processing benefits**: This design ensures clean data processing where subcategory is either:

    -   `NULL` (no selection made)
    -   Array with meaningful values (one or more valid selections)
    -   Never an empty array that requires special handling

**Difference from Step 2**: - **Step 2**: One-time data conversion for existing records - **Step 4**: Ongoing validation for all future insertions/updates

### Step 5: Add New Category Column

``` sql
ALTER TABLE reports 
ADD COLUMN category TEXT[] NOT NULL DEFAULT ARRAY['physical environment'];
```

**Purpose**: Add the new main category system: - `TEXT[]`: Array type for multiple selections - `NOT NULL`: Required field (users must select at least one category) - `DEFAULT ARRAY['physical environment']`: Sets default value for existing records

**Design decision**: No value restrictions in database - flexibility for frontend development to define available options.

### Step 6: Add Category Validation

``` sql
ALTER TABLE reports 
ADD CONSTRAINT reports_category_not_empty_check 
CHECK (array_length(category, 1) > 0);
```

**Purpose**: Ensure the category array is never empty: - Must have at least one value - Works with the NOT NULL constraint to guarantee meaningful data

## Usage Examples

After migration, data can be inserted like this:

``` sql
-- Example 1: Single subcategory, single category
INSERT INTO reports (subcategory, category, description, lng, lat) 
VALUES (['safety'], ['physical environment'], 'Broken sidewalk', 106.845, -6.208);

-- Example 2: Multiple subcategories, multiple categories
INSERT INTO reports (subcategory, category, description, lng, lat) 
VALUES (['safety', 'accessibility'], ['physical environment', 'emotional perception'], 'Dark alley with obstacles', 106.845, -6.208);

-- Example 3: No subcategory, single category
INSERT INTO reports (subcategory, category, description, lng, lat) 
VALUES (NULL, ['emotional perception'], 'Area feels unsafe', 106.845, -6.208);

-- Example 4: Invalid - empty array not allowed
-- INSERT INTO reports (subcategory, category, description, lng, lat) 
-- VALUES ([], ['emotional perception'], 'Test', 106.845, -6.208); -- This would fail
```

## Frontend Integration

### Subcategory (Optional, Multiple Selection)

``` javascript
// Can be null or array with meaningful values (no empty arrays)
subcategory: null                           // No selection
subcategory: ['safety']                     // Single selection
subcategory: ['safety', 'accessibility']   // Multiple selection
// subcategory: []                          // Not allowed - constraint prevents empty arrays
```

### Category (Required, Multiple Selection)

``` javascript
// Must have at least one value, no database restrictions
category: ['physical environment']                          // Single selection
category: ['physical environment', 'emotional perception']  // Multiple selection
// category: []  // Not allowed (constraint violation)
// category: null // Not allowed (NOT NULL constraint)
```

## Validation Rules Summary

| Column | Type | Required | Multiple Selection | Value Restrictions |
|-------------|-------------|-------------|-----------------|-----------------|
| `subcategory` | `TEXT[]` | No (can be NULL) | Yes | `'safety'`, `'accessibility'`, `'walkability'` |
| `category` | `TEXT[]` | Yes (NOT NULL) | Yes | None (frontend defined) |

## Migration Execution

1.  Run the migration script in your Supabase SQL editor
2.  Execute steps in order (dependencies between steps)
3.  Verify with the provided query at the end of the script
4.  Update your frontend code to work with the new array structure
5.  Test with sample data to ensure everything works correctly

## Rollback Considerations

If you need to rollback this migration: 1. The data conversion from string to array is not easily reversible 2. Consider backing up your data before running the migration 3. New array data would need special handling to convert back to single values

## Performance Notes

-   Array operations in PostgreSQL are efficient for small arrays
-   Consider indexing strategies if you plan to query by array values frequently
-   GIN indexes can be useful for array containment queries if needed in the future