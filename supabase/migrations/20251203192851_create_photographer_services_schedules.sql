/*
  # Create Photographer Services and Schedules Schema
  
  1. New Tables
    - `photographer_services`
      - `id` (uuid, primary key)
      - `photographer_id` (uuid, references users)
      - `name` (text) - e.g., "Básico", "Premium", "Platino"
      - `description` (text)
      - `price` (numeric)
      - `currency` (text)
      - `duration_hours` (integer)
      - `features` (jsonb) - array of features included
      - `is_active` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `photographer_schedules`
      - `id` (uuid, primary key)
      - `photographer_id` (uuid, references users)
      - `day_of_week` (integer) - 0=Sunday, 6=Saturday
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Indexes
    - Index on photographer_id for both tables
    - Index on day_of_week for schedules
  
  3. Security
    - RLS disabled for development (will be enabled in production)
*/

-- Create photographer_services table
CREATE TABLE IF NOT EXISTS photographer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  duration_hours integer NOT NULL DEFAULT 2,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photographer_schedules table
CREATE TABLE IF NOT EXISTS photographer_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(photographer_id, day_of_week, start_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photographer_services_photographer_id 
  ON photographer_services(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photographer_services_active 
  ON photographer_services(photographer_id, is_active);
CREATE INDEX IF NOT EXISTS idx_photographer_schedules_photographer_id 
  ON photographer_schedules(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photographer_schedules_day 
  ON photographer_schedules(photographer_id, day_of_week);

-- Disable RLS for development
ALTER TABLE photographer_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_schedules DISABLE ROW LEVEL SECURITY;

-- Add updated_at trigger for services
CREATE OR REPLACE FUNCTION update_photographer_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_photographer_services_updated_at
  BEFORE UPDATE ON photographer_services
  FOR EACH ROW
  EXECUTE FUNCTION update_photographer_services_updated_at();

-- Add updated_at trigger for schedules
CREATE OR REPLACE FUNCTION update_photographer_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_photographer_schedules_updated_at
  BEFORE UPDATE ON photographer_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_photographer_schedules_updated_at();
