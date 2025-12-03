/**
 * Adaptador de API que usa Supabase como backend
 * Implementa la misma interfaz que api.ts pero usando Supabase
 */

import { supabase } from './supabase';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Photographer,
  PhotographerFilters,
  Booking,
  CreateBookingRequest,
  Session,
  Media,
  PresignedUploadResponse,
  StorageUsage,
  LogEntry,
  ApiError,
} from './types';

class SupabaseApiClient {
  private currentUser: User | null = null;

  // ============ AUTENTICACIÓN ============

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login with:', credentials.email);

      // Buscar usuario en la base de datos
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .maybeSingle();

      console.log('📊 Supabase response:', { hasData: !!users, error: error?.message });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw this.createError(
          `Error de base de datos: ${error.message}`,
          'DATABASE_ERROR'
        );
      }

      if (!users) {
        console.log('❌ User not found');
        throw this.createError('Usuario no encontrado', 'USER_NOT_FOUND');
      }

      // En producción, verificar password con bcrypt
      // Por ahora, comparación simple para desarrollo
      console.log('🔑 Verifying password...');
      if (users.password_hash !== credentials.password) {
        console.log('❌ Invalid password');
        throw this.createError('Contraseña incorrecta', 'INVALID_PASSWORD');
      }

      console.log('✅ Login successful!');

      const user: User = {
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        avatar: users.avatar,
        phone: users.phone,
        created_at: users.created_at,
      };

      this.currentUser = user;

      return {
        access_token: `token_${user.id}`,
        token_type: 'bearer',
        user,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: userData.password,
          name: userData.name,
          role: userData.role,
        })
        .select()
        .single();

      if (error) {
        throw this.createError(error.message, 'REGISTER_ERROR');
      }

      const user: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar,
        phone: newUser.phone,
        created_at: newUser.created_at,
      };

      this.currentUser = user;

      return {
        access_token: `token_${user.id}`,
        token_type: 'bearer',
        user,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getMe(): Promise<User> {
    if (!this.currentUser) {
      throw this.createError('No autenticado', 'NOT_AUTHENTICATED');
    }
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  setToken(token: string | null) {
    // No se necesita en Supabase
  }

  getToken(): string | null {
    return this.currentUser ? `token_${this.currentUser.id}` : null;
  }

  // ============ FOTÓGRAFOS ============

  async getPhotographers(
    filters?: PhotographerFilters
  ): Promise<Photographer[]> {
    try {
      console.log('📸 Fetching photographers from Supabase...');

      let query = supabase
        .from('photographers')
        .select(
          `
          *,
          users!photographers_user_id_fkey (
            id,
            email,
            name,
            avatar,
            phone
          )
        `
        )
        .order('rating', { ascending: false });

      if (filters?.available_only) {
        query = query.eq('available', true);
      }

      if (filters?.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }

      if (filters?.max_price) {
        query = query.lte('price_per_session', filters.max_price);
      }

      console.log('🔍 Executing query...');
      const { data, error } = await query;

      console.log('📊 Query result:', {
        hasData: !!data,
        dataLength: data?.length,
        error: error?.message,
        errorDetails: error
      });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No photographers found');
        return [];
      }

      console.log('✅ Found', data.length, 'photographers');

      const photographers: Photographer[] = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        name: p.users.name,
        email: p.users.email,
        avatar: p.users.avatar,
        bio: p.bio,
        rating: p.rating,
        reviews_count: p.reviews_count,
        spots: p.spots,
        price_per_session: p.price_per_session,
        currency: p.currency,
        portfolio_images: p.portfolio_images,
        equipment: p.equipment,
        experience_years: p.experience_years,
        available: p.available,
      }));

      // Filtrar por spot si se especifica
      if (filters?.spot) {
        return photographers.filter((p) =>
          p.spots.some((s) =>
            s.toLowerCase().includes(filters.spot!.toLowerCase())
          )
        );
      }

      return photographers;
    } catch (error: any) {
      console.error('❌ getPhotographers error:', error);
      throw this.handleError(error);
    }
  }

  async getPhotographer(id: string): Promise<Photographer> {
    try {
      const { data, error } = await supabase
        .from('photographers')
        .select(
          `
          *,
          users!photographers_user_id_fkey (
            id,
            email,
            name,
            avatar,
            phone
          )
        `
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw this.createError('Fotógrafo no encontrado', 'NOT_FOUND');
      }

      return {
        id: data.id,
        user_id: data.user_id,
        name: data.users.name,
        email: data.users.email,
        avatar: data.users.avatar,
        bio: data.bio,
        rating: data.rating,
        reviews_count: data.reviews_count,
        spots: data.spots,
        price_per_session: data.price_per_session,
        currency: data.currency,
        portfolio_images: data.portfolio_images,
        equipment: data.equipment,
        experience_years: data.experience_years,
        available: data.available,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ============ RESERVAS ============

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    try {
      if (!this.currentUser) {
        throw this.createError('No autenticado', 'NOT_AUTHENTICATED');
      }

      // Obtener fotógrafo para el precio
      const photographer = await this.getPhotographer(
        bookingData.photographer_id
      );

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          surfer_id: this.currentUser.id,
          photographer_id: photographer.user_id,
          spot: bookingData.spot,
          date: bookingData.date,
          time: bookingData.time,
          duration_hours: bookingData.duration_hours,
          price: photographer.price_per_session,
          currency: photographer.currency,
          notes: bookingData.notes,
        })
        .select(
          `
          *,
          photographer:users!bookings_photographer_id_fkey (
            name,
            avatar
          )
        `
        )
        .single();

      if (error) {
        throw this.createError(error.message, 'CREATE_ERROR');
      }

      return {
        id: data.id,
        surfer_id: data.surfer_id,
        photographer_id: data.photographer_id,
        photographer_name: data.photographer.name,
        photographer_avatar: data.photographer.avatar,
        spot: data.spot,
        date: data.date,
        time: data.time,
        duration_hours: data.duration_hours,
        status: data.status,
        price: data.price,
        currency: data.currency,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getMyBookings(): Promise<Booking[]> {
    try {
      if (!this.currentUser) {
        throw this.createError('No autenticado', 'NOT_AUTHENTICATED');
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          photographer:users!bookings_photographer_id_fkey (
            name,
            avatar
          )
        `
        )
        .eq('surfer_id', this.currentUser.id)
        .order('date', { ascending: false });

      if (error) {
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      return (data || []).map((b: any) => ({
        id: b.id,
        surfer_id: b.surfer_id,
        photographer_id: b.photographer_id,
        photographer_name: b.photographer.name,
        photographer_avatar: b.photographer.avatar,
        spot: b.spot,
        date: b.date,
        time: b.time,
        duration_hours: b.duration_hours,
        status: b.status,
        price: b.price,
        currency: b.currency,
        notes: b.notes,
        created_at: b.created_at,
        updated_at: b.updated_at,
      }));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getBooking(id: string): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(
          `
          *,
          photographer:users!bookings_photographer_id_fkey (
            name,
            avatar
          )
        `
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw this.createError('Reserva no encontrada', 'NOT_FOUND');
      }

      return {
        id: data.id,
        surfer_id: data.surfer_id,
        photographer_id: data.photographer_id,
        photographer_name: data.photographer.name,
        photographer_avatar: data.photographer.avatar,
        spot: data.spot,
        date: data.date,
        time: data.time,
        duration_hours: data.duration_hours,
        status: data.status,
        price: data.price,
        currency: data.currency,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateBookingStatus(
    id: string,
    status: Booking['status']
  ): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select(
          `
          *,
          photographer:users!bookings_photographer_id_fkey (
            name,
            avatar
          )
        `
        )
        .single();

      if (error || !data) {
        throw this.createError('Error al actualizar reserva', 'UPDATE_ERROR');
      }

      return {
        id: data.id,
        surfer_id: data.surfer_id,
        photographer_id: data.photographer_id,
        photographer_name: data.photographer.name,
        photographer_avatar: data.photographer.avatar,
        spot: data.spot,
        date: data.date,
        time: data.time,
        duration_hours: data.duration_hours,
        status: data.status,
        price: data.price,
        currency: data.currency,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, 'cancelled');
  }

  // ============ SESIONES ============

  async getMySessions(): Promise<Session[]> {
    try {
      if (!this.currentUser) {
        throw this.createError('No autenticado', 'NOT_AUTHENTICATED');
      }

      const { data, error } = await supabase
        .from('sessions')
        .select(
          `
          *,
          photographer:users!sessions_photographer_id_fkey (
            name,
            avatar
          ),
          media (count)
        `
        )
        .eq('surfer_id', this.currentUser.id)
        .order('date', { ascending: false });

      if (error) {
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      return (data || []).map((s: any) => ({
        id: s.id,
        booking_id: s.booking_id,
        surfer_id: s.surfer_id,
        photographer_id: s.photographer_id,
        photographer_name: s.photographer.name,
        photographer_avatar: s.photographer.avatar,
        spot: s.spot,
        date: s.date,
        time: s.time,
        duration_hours: s.duration_hours,
        status: s.status,
        conditions: s.wave_height
          ? {
              wave_height: s.wave_height,
              wave_period: s.wave_period,
              wind_speed: s.wind_speed,
              wind_direction: s.wind_direction,
              tide: s.tide,
              water_temp: s.water_temp,
            }
          : undefined,
        notes: s.notes,
        media_count: s.media?.[0]?.count || 0,
        video_summary_url: s.video_summary_url,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSession(id: string): Promise<Session> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(
          `
          *,
          photographer:users!sessions_photographer_id_fkey (
            name,
            avatar
          ),
          media (count)
        `
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw this.createError('Sesión no encontrada', 'NOT_FOUND');
      }

      return {
        id: data.id,
        booking_id: data.booking_id,
        surfer_id: data.surfer_id,
        photographer_id: data.photographer_id,
        photographer_name: data.photographer.name,
        photographer_avatar: data.photographer.avatar,
        spot: data.spot,
        date: data.date,
        time: data.time,
        duration_hours: data.duration_hours,
        status: data.status,
        conditions: data.wave_height
          ? {
              wave_height: data.wave_height,
              wave_period: data.wave_period,
              wind_speed: data.wind_speed,
              wind_direction: data.wind_direction,
              tide: data.tide,
              water_temp: data.water_temp,
            }
          : undefined,
        notes: data.notes,
        media_count: data.media?.[0]?.count || 0,
        video_summary_url: data.video_summary_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSessionMedia(sessionId: string): Promise<Media[]> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('session_id', sessionId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      return (data || []).map((m: any) => ({
        id: m.id,
        session_id: m.session_id,
        type: m.type,
        url: m.url,
        thumbnail_url: m.thumbnail_url,
        filename: m.filename,
        size_bytes: m.size_bytes,
        width: m.width,
        height: m.height,
        duration_seconds: m.duration_seconds,
        uploaded_at: m.uploaded_at,
      }));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSessionLogs(sessionId: string): Promise<LogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select(
          `
          *,
          user:users!logs_user_id_fkey (
            name
          )
        `
        )
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      return (data || []).map((l: any) => ({
        id: l.id,
        session_id: l.session_id,
        user_id: l.user_id,
        user_name: l.user.name,
        action: l.action,
        description: l.description,
        timestamp: l.timestamp,
      }));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ============ SUBIDA DE ARCHIVOS ============

  async getPresignedUploadUrl(
    sessionId: string,
    filename: string,
    fileType: string
  ): Promise<PresignedUploadResponse> {
    throw this.createError('No implementado aún', 'NOT_IMPLEMENTED');
  }

  async uploadFile(presignedUrl: string, file: Blob): Promise<void> {
    throw this.createError('No implementado aún', 'NOT_IMPLEMENTED');
  }

  // ============ ALMACENAMIENTO ============

  async getStorageUsage(): Promise<StorageUsage> {
    try {
      if (!this.currentUser) {
        throw this.createError('No autenticado', 'NOT_AUTHENTICATED');
      }

      // Calcular uso de almacenamiento
      const { data, error } = await supabase
        .from('media')
        .select('size_bytes')
        .in('session_id', [
          supabase
            .from('sessions')
            .select('id')
            .eq('surfer_id', this.currentUser.id),
        ]);

      if (error) {
        throw this.createError(error.message, 'FETCH_ERROR');
      }

      const usedBytes = (data || []).reduce(
        (sum: number, m: any) => sum + (m.size_bytes || 0),
        0
      );
      const totalBytes = 5 * 1024 * 1024 * 1024; // 5 GB

      return {
        used_bytes: usedBytes,
        total_bytes: totalBytes,
        used_gb: usedBytes / (1024 * 1024 * 1024),
        total_gb: 5,
        percentage: (usedBytes / totalBytes) * 100,
        plan: 'Free Plan',
      };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ============ UTILIDADES ============

  private createError(message: string, code: string): ApiError {
    return { message, code };
  }

  private handleError(error: any): ApiError {
    if (error.message && error.code) {
      return error as ApiError;
    }
    return {
      message: error.message || 'Error desconocido',
      code: 'UNKNOWN_ERROR',
    };
  }
}

export const api = new SupabaseApiClient();
export default api;
