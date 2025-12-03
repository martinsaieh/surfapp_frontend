/**
 * Pantalla inicial - El AuthContext maneja la navegación automática
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('📍 Index screen - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

    if (!isLoading) {
      const destination = isAuthenticated ? '/(tabs)/home' : '/(auth)/login';
      console.log('🚀 Redirecting to:', destination);
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated]);

  return <LoadingSpinner message="Cargando..." />;
}
