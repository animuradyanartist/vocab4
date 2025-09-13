/*
  # Add visibility column to public_texts table

  1. Changes
    - Add `visibility` column to `public_texts` table with default value 'public'
    - Add `created_for_groups` column to track if text was created for specific groups
  
  2. Security
    - No changes to existing RLS policies needed
*/

-- Add visibility column to public_texts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'public_texts' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE public_texts ADD COLUMN visibility text DEFAULT 'public' NOT NULL;
  END IF;
END $$;

-- Add created_for_groups column to track group-specific texts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'public_texts' AND column_name = 'created_for_groups'
  ) THEN
    ALTER TABLE public_texts ADD COLUMN created_for_groups boolean DEFAULT false NOT NULL;
  END IF;
END $$;