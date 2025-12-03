/**
 * Pantalla inicial - El AuthContext maneja la navegación automática
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('📍 Index screen - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('🚀 Redirecting to: login');
        router.replace('/(auth)/login');
      } else if (user) {
        const destination =
          user.role === 'photographer'
            ? '/(tabs-photographer)/services'
            : '/(tabs)/home';
        console.log('🚀 Redirecting to:', destination, 'role:', user.role);
        router.replace(destination);
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return <LoadingSpinner message="Cargando..." />;
}
