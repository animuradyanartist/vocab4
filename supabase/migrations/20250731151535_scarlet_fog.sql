/*
  # Create words table for vocabulary app

  1. New Tables
    - `words`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `english` (text, not null)
      - `armenian` (text, not null)
      - `date_added` (timestamptz, default now())
      - `is_learned` (boolean, default false)

  2. Security
    - Enable RLS on `words` table
    - Add policies for authenticated users to manage their own words
*/

-- Create the words table
CREATE TABLE IF NOT EXISTS words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  english text NOT NULL,
  armenian text NOT NULL,
  date_added timestamptz DEFAULT now() NOT NULL,
  is_learned boolean DEFAULT false NOT NULL
);

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own words
CREATE POLICY "Users can view their own words"
  ON words
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
  ON words
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
  ON words
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
  ON words
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS words_user_id_idx ON words(user_id);
CREATE INDEX IF NOT EXISTS words_date_added_idx ON words(date_added DESC);