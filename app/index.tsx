/**
 * Pantalla inicial - El AuthContext maneja la navegación automática
 */

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function IndexScreen() {
  return <LoadingSpinner message="Cargando..." />;
}
