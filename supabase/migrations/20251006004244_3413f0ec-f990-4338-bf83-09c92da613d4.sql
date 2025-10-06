-- Task 2 & 4: Update gender to only male/female

-- Step 1: Remove the default
ALTER TABLE animals ALTER COLUMN gender DROP DEFAULT;

-- Step 2: Update existing 'unknown' values to NULL
UPDATE animals SET gender = NULL WHERE gender = 'unknown';

-- Step 3: Rename old enum
ALTER TYPE animal_gender RENAME TO animal_gender_old;

-- Step 4: Create new enum with only male/female
CREATE TYPE animal_gender AS ENUM ('male', 'female');

-- Step 5: Update the column to use new enum
ALTER TABLE animals 
  ALTER COLUMN gender TYPE animal_gender 
  USING CASE 
    WHEN gender::text = 'male' THEN 'male'::animal_gender
    WHEN gender::text = 'female' THEN 'female'::animal_gender
    ELSE NULL
  END;

-- Step 6: Drop old enum
DROP TYPE animal_gender_old;