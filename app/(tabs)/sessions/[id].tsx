/**
 * Pantalla de detalle de sesión
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Waves,
  Wind,
  CloudRain,
  FileText,
} from 'lucide-react-native';
import api from '@/lib/api-supabase';
import { Session, Media, LogEntry } from '@/lib/types';
import { MediaGrid } from '@/components/cards/MediaGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'logs'>('media');

  useEffect(() => {
    if (id) {
      loadSessionData();
    }
  }, [id]);

  const loadSessionData = async () => {
    try {
      setError(null);
      const [sessionData, mediaData, logsData] = await Promise.all([
        api.getSession(id!),
        api.getSessionMedia(id!),
        api.getSessionLogs(id!).catch(() => []),
      ]);

      setSession(sessionData);
      setMedia(mediaData);
      setLogs(logsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la sesión');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSessionData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando sesión..." />;
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          message={error || 'Sesión no encontrada'}
          onRetry={loadSessionData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Sesión</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }>
        <View style={styles.infoCard}>
          <Text style={styles.spotName}>{session.spot}</Text>
          <Text style={styles.date}>{formatDate(session.date)}</Text>

          <View style={styles.infoRow}>
            <Clock size={16} color="#8E8E93" />
            <Text style={styles.infoText}>
              {session.time} - {session.duration_hours} horas
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color="#8E8E93" />
            <Text style={styles.infoText}>{session.spot}</Text>
          </View>

          <Text style={styles.photographer}>
            Con {session.photographer_name}
          </Text>
        </View>

        {session.conditions && (
          <View style={styles.conditionsCard}>
            <Text style={styles.sectionTitle}>Condiciones del Mar</Text>
            <View style={styles.conditionsGrid}>
              <View style={styles.conditionItem}>
                <Waves size={20} color="#007AFF" />
                <Text style={styles.conditionLabel}>Olas</Text>
                <Text style={styles.conditionValue}>
                  {session.conditions.wave_height}m
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <Wind size={20} color="#007AFF" />
                <Text style={styles.conditionLabel}>Viento</Text>
                <Text style={styles.conditionValue}>
                  {session.conditions.wind_speed} km/h
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <CloudRain size={20} color="#007AFF" />
                <Text style={styles.conditionLabel}>Marea</Text>
                <Text style={styles.conditionValue}>
                  {session.conditions.tide}
                </Text>
              </View>
            </View>
          </View>
        )}

        {session.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'media' && styles.tabActive]}
            onPress={() => setActiveTab('media')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'media' && styles.tabTextActive,
              ]}>
              Fotos y Videos ({media.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
            onPress={() => setActiveTab('logs')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'logs' && styles.tabTextActive,
              ]}>
              Bitácora ({logs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'media' ? (
          <View style={styles.mediaContainer}>
            <MediaGrid media={media} />
          </View>
        ) : (
          <View style={styles.logsContainer}>
            {logs.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay registros en la bitácora
              </Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <FileText size={16} color="#8E8E93" />
                  <View style={styles.logContent}>
                    <Text style={styles.logDescription}>
                      {log.description}
                    </Text>
                    <Text style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleString('es-ES')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  spotName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 8,
  },
  photographer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  conditionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  conditionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  conditionItem: {
    alignItems: 'center',
  },
  conditionLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  conditionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 2,
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  mediaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
  },
  logsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logContent: {
    flex: 1,
    marginLeft: 12,
  },
  logDescription: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 16,
  },
});
