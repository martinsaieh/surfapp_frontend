/*
  # Deshabilitar RLS temporalmente para desarrollo
  
  Como estamos usando autenticación personalizada en lugar de Supabase Auth,
  las políticas RLS que dependen de auth.uid() bloquean el acceso.
  
  Esta migración deshabilita temporalmente RLS en sessions para permitir
  el desarrollo. En producción, deberíamos:
  1. Usar Supabase Auth correctamente, O
  2. Usar service_role_key, O
  3. Implementar políticas RLS basadas en claims personalizados
*/

-- Eliminar las políticas existentes
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Photographers can create sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;

-- Deshabilitar RLS en sessions (SOLO PARA DESARROLLO)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Hacer lo mismo para bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Y para media
DROP POLICY IF EXISTS "Users can view session media" ON media;
DROP POLICY IF EXISTS "Photographers can upload media" ON media;

ALTER TABLE media DISABLE ROW LEVEL SECURITY;

-- Y para logs
DROP POLICY IF EXISTS "Users can view session logs" ON logs;

ALTER TABLE logs DISABLE ROW LEVEL SECURITY;
