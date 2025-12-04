import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  ClipboardList,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface BookingRequest {
  id: string;
  surfer_id: string;
  surfer_name: string;
  spot: string;
  date: string;
  time: string;
  duration_hours: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

export default function RequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select(
          `
          *,
          surfer:users!sessions_surfer_id_fkey(name)
        `
        )
        .eq('photographer_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (fetchError) throw fetchError;

      const formatted = (data || []).map((session: any) => ({
        id: session.id,
        surfer_id: session.surfer_id,
        surfer_name: session.surfer?.name || 'Usuario',
        spot: session.spot,
        date: session.date,
        time: session.time,
        duration_hours: session.duration_hours,
        status: session.status,
        notes: session.notes,
        created_at: session.created_at,
      }));

      setRequests(formatted);
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const updateRequestStatus = async (
    requestId: string,
    newStatus: 'confirmed' | 'cancelled'
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (updateError) throw updateError;

      Alert.alert(
        'Éxito',
        newStatus === 'confirmed'
          ? 'Solicitud confirmada'
          : 'Solicitud rechazada'
      );
      loadRequests();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar');
    }
  };

  const handleConfirm = (request: BookingRequest) => {
    Alert.alert(
      'Confirmar Reserva',
      `¿Confirmar la sesión con ${request.surfer_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => updateRequestStatus(request.id, 'confirmed'),
        },
      ]
    );
  };

  const handleReject = (request: BookingRequest) => {
    Alert.alert(
      'Rechazar Reserva',
      `¿Rechazar la sesión con ${request.surfer_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => updateRequestStatus(request.id, 'cancelled'),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'confirmed':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      case 'completed':
        return '#007AFF';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const renderRequest = ({ item }: { item: BookingRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.surferInfo}>
          <View style={styles.avatarCircle}>
            <User size={20} color="#0A7AFF" />
          </View>
          <View style={styles.surferDetails}>
            <Text style={styles.surferName}>{item.surfer_name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + '20' },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <MapPin size={16} color="#0A7AFF" />
          </View>
          <Text style={styles.detailText}>{item.spot}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <Calendar size={16} color="#0A7AFF" />
          </View>
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.iconCircle}>
            <Clock size={16} color="#0A7AFF" />
          </View>
          <Text style={styles.detailText}>
            {item.time} ({item.duration_hours}h)
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notas del cliente</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item)}>
            <XCircle size={20} color="#FF3B30" />
            <Text style={styles.rejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => handleConfirm(item)}>
            <CheckCircle size={20} color="#FFFFFF" />
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner message="Cargando solicitudes..." />;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A7AFF', '#00C6FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ClipboardList size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Solicitudes</Text>
              <Text style={styles.headerSubtitle}>
                {pendingCount > 0
                  ? `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`
                  : 'Todo al día'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.filterContainer}>
          {['all', 'pending', 'confirmed'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterActive]}
              onPress={() => setFilter(f as any)}>
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}>
                {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Confirmadas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {error && <ErrorMessage message={error} onRetry={loadRequests} />}

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No hay solicitudes {filter !== 'all' ? getStatusText(filter).toLowerCase() : ''}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterActive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterTextActive: {
    color: '#0A7AFF',
  },
  list: {
    padding: 16,
    paddingTop: 20,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  requestHeader: {
    marginBottom: 16,
  },
  surferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A7AFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surferDetails: {
    marginLeft: 12,
    flex: 1,
  },
  surferName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#FF3B3015',
    borderWidth: 1,
    borderColor: '#FF3B3030',
  },
  confirmButton: {
    backgroundColor: '#0A7AFF',
    shadowColor: '#0A7AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
});
