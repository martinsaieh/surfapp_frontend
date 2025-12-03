/**
 * Tipos globales de la aplicación SurfApp
 */

// Usuario
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'surfer' | 'photographer';
  avatar?: string;
  phone?: string;
  created_at: string;
}

// Autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'surfer' | 'photographer';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Fotógrafo
export interface Photographer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating: number;
  reviews_count: number;
  spots: string[];
  price_per_session: number;
  currency: string;
  portfolio_images?: string[];
  equipment?: string[];
  experience_years?: number;
  available: boolean;
}

// Reserva (Booking)
export interface Booking {
  id: string;
  surfer_id: string;
  photographer_id: string;
  photographer_name: string;
  photographer_avatar?: string;
  spot: string;
  date: string;
  time: string;
  duration_hours: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingRequest {
  photographer_id: string;
  spot: string;
  date: string;
  time: string;
  duration_hours: number;
  notes?: string;
}

// Sesión
export interface Session {
  id: string;
  booking_id: string;
  surfer_id: string;
  photographer_id: string;
  photographer_name: string;
  photographer_avatar?: string;
  spot: string;
  date: string;
  time: string;
  duration_hours: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  conditions?: WaveConditions;
  notes?: string;
  media_count: number;
  video_summary_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WaveConditions {
  wave_height: number;
  wave_period: number;
  wind_speed: number;
  wind_direction: string;
  tide: string;
  water_temp: number;
}

// Media
export interface Media {
  id: string;
  session_id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
  filename: string;
  size_bytes: number;
  width?: number;
  height?: number;
  duration_seconds?: number;
  uploaded_at: string;
  metadata?: Record<string, any>;
}

export interface PresignedUploadResponse {
  upload_url: string;
  media_id: string;
  expires_at: string;
}

// Almacenamiento
export interface StorageUsage {
  used_bytes: number;
  total_bytes: number;
  used_gb: number;
  total_gb: number;
  percentage: number;
  plan: string;
}

// Bitácora
export interface LogEntry {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  action: string;
  description: string;
  timestamp: string;
}

// Filtros y búsqueda
export interface PhotographerFilters {
  spot?: string;
  min_rating?: number;
  max_price?: number;
  available_only?: boolean;
}

// API Response generics
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Error handling
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
