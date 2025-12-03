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
      // Usuario autenticado en rutas de auth, redirigir según rol
      if (user.role === 'photographer') {
        setTimeout(() => router.replace('/(tabs-photographer)/services'), 0);
      } else {
        setTimeout(() => router.replace('/(tabs)/home'), 0);
      }
    }
  }, [user, segments, isLoading]);

  async function loadSession() {
    console.log('🔄 Starting loadSession...');
    try {
      console.log('📦 Getting token from storage...');
      const token = await authStorage.getToken();
      console.log('📦 Getting user from storage...');
      const savedUser = await authStorage.getUser();

      console.log('📱 Loading session:', {
        hasToken: !!token,
        hasUser: !!savedUser,
        userId: savedUser?.id,
        userEmail: savedUser?.email
      });

      if (token && savedUser) {
        console.log('🔧 Setting token and user in API...');
        api.setToken(token);
        api.setCurrentUser(savedUser);
        setUser(savedUser);
        console.log('✅ Session restored for:', savedUser.email);
      } else {
        console.log('❌ No saved session found');
      }
    } catch (err) {
      console.error('❌ Error loading session:', err);
      try {
        await clearSession();
      } catch (clearErr) {
        console.error('❌ Error clearing session:', clearErr);
      }
    } finally {
      console.log('✅ Setting isLoading to false');
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

      // Configurar token y usuario en API client
      api.setToken(response.access_token);
      api.setCurrentUser(response.user);
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

      // Configurar token y usuario en API client
      api.setToken(response.access_token);
      api.setCurrentUser(response.user);
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
    api.setCurrentUser(null);
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
