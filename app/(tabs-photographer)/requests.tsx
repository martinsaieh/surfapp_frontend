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
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
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
          <User size={20} color="#007AFF" />
          <Text style={styles.surferName}>{item.surfer_name}</Text>
        </View>
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

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.spot}</Text>
        </View>

        <View style={styles.detailRow}>
          <Calendar size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Clock size={16} color="#8E8E93" />
          <Text style={styles.detailText}>
            {item.time} ({item.duration_hours}h)
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notas:</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitudes</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  surferInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surferName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#3C3C43',
  },
  notesContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 15,
    color: '#3C3C43',
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
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: '#FF3B3010',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  rejectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
