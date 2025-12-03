/**
 * Cliente de Supabase para la base de datos
 */

import { createClient } from '@supabase/supabase-js';

// TEMPORAL: Hardcoded para evitar problemas con variables de entorno en Expo Web
// En producción, usar process.env correctamente
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://oypfxtbtxbsutqirheoa.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cGZ4dGJ0eGJzdXRxaXJoZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTc5OTcsImV4cCI6MjA4MDMzMzk5N30.k1uonuTVXKTefiH8rTHbrGO4BATYSb5XrixF3VrID-w';

console.log('🔧 Supabase configuration:');
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseAnonKey ? '✅ Present' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
