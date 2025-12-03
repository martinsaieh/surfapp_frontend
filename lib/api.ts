/**
 * Cliente API genérico para consumir backend FastAPI
 */

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

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
const API_TIMEOUT = parseInt(
  process.env.EXPO_PUBLIC_API_TIMEOUT || '30000',
  10
);

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message:
            errorData.message ||
            errorData.detail ||
            `HTTP Error: ${response.status}`,
          code: errorData.code || `HTTP_${response.status}`,
          details: errorData,
        };
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          code: 'TIMEOUT',
        } as ApiError;
      }

      if (error.message && error.code) {
        throw error as ApiError;
      }

      throw {
        message: error.message || 'Network error',
        code: 'NETWORK_ERROR',
      } as ApiError;
    }
  }

  // ============ AUTENTICACIÓN ============

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // ============ FOTÓGRAFOS ============

  async getPhotographers(
    filters?: PhotographerFilters
  ): Promise<Photographer[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/photographers?${queryString}`
      : '/photographers';

    return this.request<Photographer[]>(endpoint);
  }

  async getPhotographer(id: string): Promise<Photographer> {
    return this.request<Photographer>(`/photographers/${id}`);
  }

  // ============ RESERVAS (BOOKINGS) ============

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings/me');
  }

  async getBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async updateBookingStatus(
    id: string,
    status: Booking['status']
  ): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, 'cancelled');
  }

  // ============ SESIONES ============

  async getMySessions(): Promise<Session[]> {
    return this.request<Session[]>('/surfers/sessions');
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async getSessionMedia(sessionId: string): Promise<Media[]> {
    return this.request<Media[]>(`/sessions/${sessionId}/media`);
  }

  async getSessionLogs(sessionId: string): Promise<LogEntry[]> {
    return this.request<LogEntry[]>(`/sessions/${sessionId}/logs`);
  }

  // ============ SUBIDA DE ARCHIVOS ============

  async getPresignedUploadUrl(
    sessionId: string,
    filename: string,
    fileType: string
  ): Promise<PresignedUploadResponse> {
    return this.request<PresignedUploadResponse>(
      `/sessions/${sessionId}/media/presign`,
      {
        method: 'POST',
        body: JSON.stringify({
          filename,
          content_type: fileType,
        }),
      }
    );
  }

  async uploadFile(presignedUrl: string, file: Blob): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw {
        message: 'Failed to upload file',
        code: 'UPLOAD_ERROR',
      } as ApiError;
    }
  }

  // ============ ALMACENAMIENTO ============

  async getStorageUsage(): Promise<StorageUsage> {
    return this.request<StorageUsage>('/me/storage-usage');
  }
}

export const api = new ApiClient(API_URL, API_TIMEOUT);
export default api;
