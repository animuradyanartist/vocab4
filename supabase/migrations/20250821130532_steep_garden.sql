/*
  # Public Texts System

  1. New Tables
    - `public_texts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `body` (text)
      - `created_by` (uuid, references auth.uid())
      - `created_at` (timestamp)
    - `user_saved_texts`
      - `user_id` (uuid, references auth.uid())
      - `text_id` (uuid, references public_texts.id)
      - `added_at` (timestamp)
    - `admins` (optional)
      - `user_id` (uuid, references auth.uid())

  2. Security
    - Enable RLS on all tables
    - public_texts: anyone can select, only admins can insert/update/delete
    - user_saved_texts: users can only manage their own rows
    - admins: only readable by authenticated users
*/

-- Create public_texts table
CREATE TABLE IF NOT EXISTS public_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_saved_texts table
CREATE TABLE IF NOT EXISTS user_saved_texts (
  user_id uuid NOT NULL,
  text_id uuid NOT NULL REFERENCES public_texts(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, text_id)
);

-- Create admins table (optional allowlist)
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY,
  added_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS public_texts_created_at_idx ON public_texts(created_at DESC);
CREATE INDEX IF NOT EXISTS public_texts_created_by_idx ON public_texts(created_by);
CREATE INDEX IF NOT EXISTS user_saved_texts_user_id_idx ON user_saved_texts(user_id);
CREATE INDEX IF NOT EXISTS user_saved_texts_text_id_idx ON user_saved_texts(text_id);

-- Enable RLS
ALTER TABLE public_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for public_texts
CREATE POLICY "Anyone can view public texts"
  ON public_texts
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can create public texts"
  ON public_texts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update public texts"
  ON public_texts
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete public texts"
  ON public_texts
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for user_saved_texts
CREATE POLICY "Users can view their own saved texts"
  ON user_saved_texts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save texts for themselves"
  ON user_saved_texts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own saved texts"
  ON user_saved_texts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for admins table
CREATE POLICY "Authenticated users can view admin list"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only existing admins can manage admin list"
  ON admins
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));