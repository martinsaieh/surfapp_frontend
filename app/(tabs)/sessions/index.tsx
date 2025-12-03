/**
 * Pantalla de listado de sesiones
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, Waves } from 'lucide-react-native';
import api from '@/lib/api-supabase';
import { Session } from '@/lib/types';
import { SessionCard } from '@/components/cards/SessionCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | Session['status']
  >('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [statusFilter, sessions]);

  const loadSessions = async () => {
    try {
      setError(null);
      const data = await api.getMySessions();
      setSessions(data);
      setFilteredSessions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar sesiones');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterSessions = () => {
    if (statusFilter === 'all') {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(sessions.filter((s) => s.status === statusFilter));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSessions();
  };

  const getStatusCount = (status: Session['status']) => {
    return sessions.filter((s) => s.status === status).length;
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando sesiones..." />;
  }

  if (error && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadSessions} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A7AFF', '#00C6FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Sesiones</Text>
          <Text style={styles.subtitle}>{sessions.length} sesiones en total</Text>
        </View>
      </LinearGradient>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('all')}>
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'all' && styles.filterButtonTextActive,
            ]}>
            Todas ({sessions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'scheduled' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('scheduled')}>
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'scheduled' && styles.filterButtonTextActive,
            ]}>
            Programadas ({getStatusCount('scheduled')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'in_progress' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('in_progress')}>
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'in_progress' && styles.filterButtonTextActive,
            ]}>
            En Progreso ({getStatusCount('in_progress')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => setStatusFilter('completed')}>
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'completed' && styles.filterButtonTextActive,
            ]}>
            Completadas ({getStatusCount('completed')})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSessions}
        renderItem={({ item }) => <SessionCard session={item} />}
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
              {statusFilter === 'all'
                ? 'Aún no tienes sesiones'
                : `No tienes sesiones ${
                    statusFilter === 'scheduled'
                      ? 'programadas'
                      : statusFilter === 'in_progress'
                        ? 'en progreso'
                        : 'completadas'
                  }`}
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
    paddingBottom: 20,
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
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#0A7AFF',
    shadowColor: '#0A7AFF',
    shadowOpacity: 0.3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C3C43',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});
