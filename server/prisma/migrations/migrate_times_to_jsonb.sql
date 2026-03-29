-- Migration: Convert times from String[] to JSONB
-- Transforms times array into array of objects with time and ticketUrl

-- Step 1: Add temporary columns
ALTER TABLE "MovieEvent" ADD COLUMN "times_new" JSONB;
ALTER TABLE "MovieEvent" ADD COLUMN "ticketUrls_backup" TEXT[];

-- Step 2: Backup ticketUrls (in case we need them)
UPDATE "MovieEvent" SET "ticketUrls_backup" = "ticketUrls";

-- Step 3: Transform times array to JSONB array of objects
-- For each time, create an object { time: "value", ticketUrl: null }
UPDATE "MovieEvent"
SET "times_new" = (
  SELECT jsonb_agg(
    jsonb_build_object('time', time_value)
  )
  FROM unnest(times) AS time_value
);

-- Step 4: Drop old columns
ALTER TABLE "MovieEvent" DROP COLUMN "times";
ALTER TABLE "MovieEvent" DROP COLUMN "ticketUrls";

-- Step 5: Rename new column to times
ALTER TABLE "MovieEvent" RENAME COLUMN "times_new" TO "times";

-- Step 6: Make times NOT NULL
ALTER TABLE "MovieEvent" ALTER COLUMN "times" SET NOT NULL;

-- Step 7: Clean up backup column (optional - keep it for now as safety)
-- ALTER TABLE "MovieEvent" DROP COLUMN "ticketUrls_backup";
