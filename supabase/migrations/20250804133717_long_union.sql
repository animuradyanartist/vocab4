/*
  # Create texts table for Text Practice feature

  1. New Tables
    - `texts`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `content` (text, not null)
      - `user_id` (uuid, foreign key to auth.users)
      - `date_added` (timestamp with time zone, default now())

  2. Security
    - Enable RLS on `texts` table
    - Add policies for authenticated users to manage their own texts
*/

CREATE TABLE IF NOT EXISTS texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_added timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own texts"
  ON texts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own texts"
  ON texts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own texts"
  ON texts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own texts"
  ON texts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS texts_user_id_idx ON texts(user_id);
CREATE INDEX IF NOT EXISTS texts_date_added_idx ON texts(date_added DESC);