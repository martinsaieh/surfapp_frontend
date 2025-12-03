/**
 * Card para mostrar sesión de surf
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Calendar, Clock, MapPin, Image as ImageIcon } from 'lucide-react-native';
import { Session } from '@/lib/types';
import { useRouter } from 'expo-router';

interface SessionCardProps {
  session: Session;
  style?: ViewStyle;
  onPress?: () => void;
}

export function SessionCard({ session, style, onPress }: SessionCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(tabs)/sessions/${session.id}`);
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return '#007AFF';
      case 'in_progress':
        return '#FF9500';
      case 'completed':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: Session['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <Image
          source={{
            uri:
              session.photographer_avatar ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.photographerName}>
            {session.photographer_name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(session.status) + '20' },
            ]}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(session.status) },
              ]}>
              {getStatusLabel(session.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#8E8E93" />
          <Text style={styles.infoText}>{formatDate(session.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#8E8E93" />
          <Text style={styles.infoText}>
            {session.time} ({session.duration_hours}h)
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#8E8E93" />
          <Text style={styles.infoText}>{session.spot}</Text>
        </View>
      </View>

      {session.media_count > 0 && (
        <View style={styles.footer}>
          <ImageIcon size={16} color="#007AFF" />
          <Text style={styles.mediaText}>
            {session.media_count} {session.media_count === 1 ? 'foto' : 'fotos'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photographerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  mediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
});
