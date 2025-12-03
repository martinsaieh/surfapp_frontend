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
import { Filter } from 'lucide-react-native';
import api from '@/lib/api';
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
      <View style={styles.header}>
        <Text style={styles.title}>Mis Sesiones</Text>
      </View>

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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
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
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
