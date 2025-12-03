/*
  # Crear esquema completo de SurfApp

  1. Nuevas Tablas
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `role` (text: 'surfer' | 'photographer')
      - `avatar` (text, opcional)
      - `phone` (text, opcional)
      - `created_at` (timestamptz)
    
    - `photographers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `bio` (text, opcional)
      - `rating` (numeric, default 5.0)
      - `reviews_count` (integer, default 0)
      - `spots` (text array)
      - `price_per_session` (numeric)
      - `currency` (text, default 'USD')
      - `portfolio_images` (text array, opcional)
      - `equipment` (text array, opcional)
      - `experience_years` (integer, default 0)
      - `available` (boolean, default true)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `surfer_id` (uuid, foreign key)
      - `photographer_id` (uuid, foreign key)
      - `spot` (text)
      - `date` (date)
      - `time` (text)
      - `duration_hours` (integer)
      - `status` (text: 'pending' | 'confirmed' | 'completed' | 'cancelled')
      - `price` (numeric)
      - `currency` (text, default 'USD')
      - `notes` (text, opcional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sessions`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `surfer_id` (uuid, foreign key)
      - `photographer_id` (uuid, foreign key)
      - `spot` (text)
      - `date` (date)
      - `time` (text)
      - `duration_hours` (integer)
      - `status` (text: 'scheduled' | 'in_progress' | 'completed')
      - `wave_height` (numeric, opcional)
      - `wave_period` (numeric, opcional)
      - `wind_speed` (numeric, opcional)
      - `wind_direction` (text, opcional)
      - `tide` (text, opcional)
      - `water_temp` (numeric, opcional)
      - `notes` (text, opcional)
      - `video_summary_url` (text, opcional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `media`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `type` (text: 'photo' | 'video')
      - `url` (text)
      - `thumbnail_url` (text, opcional)
      - `filename` (text)
      - `size_bytes` (bigint)
      - `width` (integer, opcional)
      - `height` (integer, opcional)
      - `duration_seconds` (integer, opcional)
      - `uploaded_at` (timestamptz)
    
    - `logs`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `description` (text)
      - `timestamp` (timestamptz)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para lectura/escritura basadas en autenticación
*/

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('surfer', 'photographer')),
  avatar text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Tabla de fotógrafos (perfil extendido)
CREATE TABLE IF NOT EXISTS photographers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio text,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  spots text[] DEFAULT '{}',
  price_per_session numeric NOT NULL,
  currency text DEFAULT 'USD',
  portfolio_images text[] DEFAULT '{}',
  equipment text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  available boolean DEFAULT true
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  surfer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  photographer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  spot text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration_hours integer NOT NULL CHECK (duration_hours > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  price numeric NOT NULL,
  currency text DEFAULT 'USD',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  surfer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  photographer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  spot text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  duration_hours integer NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  wave_height numeric,
  wave_period numeric,
  wind_speed numeric,
  wind_direction text,
  tide text,
  water_temp numeric,
  notes text,
  video_summary_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de media (fotos/videos)
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video')),
  url text NOT NULL,
  thumbnail_url text,
  filename text NOT NULL,
  size_bytes bigint NOT NULL,
  width integer,
  height integer,
  duration_seconds integer,
  uploaded_at timestamptz DEFAULT now()
);

-- Tabla de logs/bitácora
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  description text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_photographers_user_id ON photographers(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_surfer_id ON bookings(surfer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_photographer_id ON bookings(photographer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_surfer_id ON sessions(surfer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_photographer_id ON sessions(photographer_id);
CREATE INDEX IF NOT EXISTS idx_media_session_id ON media(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users (solo lectura pública, escritura propia)
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para photographers (lectura pública, escritura propia)
CREATE POLICY "Anyone can view photographers"
  ON photographers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Photographers can update own profile"
  ON photographers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = surfer_id OR auth.uid() = photographer_id);

CREATE POLICY "Surfers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = surfer_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = surfer_id OR auth.uid() = photographer_id)
  WITH CHECK (auth.uid() = surfer_id OR auth.uid() = photographer_id);

-- Políticas para sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = surfer_id OR auth.uid() = photographer_id);

CREATE POLICY "Photographers can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = photographer_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = surfer_id OR auth.uid() = photographer_id)
  WITH CHECK (auth.uid() = surfer_id OR auth.uid() = photographer_id);

-- Políticas para media
CREATE POLICY "Users can view session media"
  ON media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = media.session_id
      AND (sessions.surfer_id = auth.uid() OR sessions.photographer_id = auth.uid())
    )
  );

CREATE POLICY "Photographers can upload media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = media.session_id
      AND sessions.photographer_id = auth.uid()
    )
  );

-- Políticas para logs
CREATE POLICY "Users can view session logs"
  ON logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = logs.session_id
      AND (sessions.surfer_id = auth.uid() OR sessions.photographer_id = auth.uid())
    )
  );

CREATE POLICY "Users can create logs"
  ON logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
