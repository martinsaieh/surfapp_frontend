/*
  # Agregar campos de perfil para fotógrafos

  1. Cambios
    - Agregar columna `bio` (texto, biografía/descripción del fotógrafo)
    - Agregar columna `experience_years` (número entero, años de experiencia)
    - Agregar columna `equipment` (array de texto, equipo fotográfico disponible)
  
  2. Notas
    - Los campos son opcionales (nullable) para no romper usuarios existentes
    - El array de equipment permite múltiples artículos
*/

-- Agregar campos de perfil para fotógrafos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'experience_years'
  ) THEN
    ALTER TABLE users ADD COLUMN experience_years integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'equipment'
  ) THEN
    ALTER TABLE users ADD COLUMN equipment text[] DEFAULT '{}';
  END IF;
END $$;