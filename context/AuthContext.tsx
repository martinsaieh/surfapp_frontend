/**
 * Context global para manejo de autenticación
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, useSegments } from 'expo-router';
import api from '@/lib/api-supabase';
import { authStorage } from '@/lib/auth';
import { User, LoginRequest, RegisterRequest, ApiError } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const segments = useSegments();

  // Cargar sesión al iniciar
  useEffect(() => {
    loadSession();
  }, []);

  // Proteger rutas basado en autenticación
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Usuario no autenticado intentando acceder a rutas protegidas
      setTimeout(() => router.replace('/(auth)/login'), 0);
    } else if (user && inAuthGroup) {
      // Usuario autenticado en rutas de auth, redirigir a home
      setTimeout(() => router.replace('/(tabs)/home'), 0);
    }
  }, [user, segments, isLoading]);

  async function loadSession() {
    try {
      const token = await authStorage.getToken();
      const savedUser = await authStorage.getUser();

      if (token && savedUser) {
        api.setToken(token);
        setUser(savedUser);

        // Opcional: validar token con el backend
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
          await authStorage.saveUser(currentUser);
        } catch (err) {
          // Token inválido, limpiar sesión
          await clearSession();
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginRequest) {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.login(credentials);

      // Guardar token y usuario
      await authStorage.saveToken(response.access_token);
      await authStorage.saveUser(response.user);

      // Configurar token en API client
      api.setToken(response.access_token);
      setUser(response.user);

      // La navegación se maneja automáticamente en el useEffect
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(userData: RegisterRequest) {
    try {
      setError(null);
      setIsLoading(true);

      const response = await api.register(userData);

      // Guardar token y usuario
      await authStorage.saveToken(response.access_token);
      await authStorage.saveUser(response.user);

      // Configurar token en API client
      api.setToken(response.access_token);
      setUser(response.user);

      // La navegación se maneja automáticamente en el useEffect
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al registrarse');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      // Intentar cerrar sesión en el backend
      await api.logout().catch(() => {
        // Ignorar errores del backend al cerrar sesión
      });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      await clearSession();
      setIsLoading(false);
    }
  }

  async function clearSession() {
    await authStorage.clearAll();
    api.setToken(null);
    setUser(null);
    setError(null);
  }

  function clearError() {
    setError(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
