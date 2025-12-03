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
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, MapPin, Image as ImageIcon, Waves } from 'lucide-react-native';
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
      activeOpacity={0.9}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  session.photographer_avatar ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
              }}
              style={styles.avatar}
            />
            <View style={styles.waveIcon}>
              <Waves size={16} color="#0A7AFF" strokeWidth={2.5} />
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.photographerName}>
              {session.photographer_name}
            </Text>
            <Text style={styles.spotName}>{session.spot}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(session.status) },
            ]}>
            <Text style={styles.statusText}>
              {getStatusLabel(session.status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar size={16} color="#0A7AFF" />
            </View>
            <Text style={styles.infoText}>{formatDate(session.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Clock size={16} color="#0A7AFF" />
            </View>
            <Text style={styles.infoText}>
              {session.time} • {session.duration_hours}h
            </Text>
          </View>
        </View>

        {session.media_count > 0 && (
          <View style={styles.footer}>
            <LinearGradient
              colors={['#0A7AFF', '#00C6FB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mediaContainer}>
              <ImageIcon size={18} color="#FFFFFF" />
              <Text style={styles.mediaText}>
                {session.media_count} {session.media_count === 1 ? 'foto' : 'fotos'}
              </Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  waveIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  photographerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  spotName: {
    fontSize: 14,
    color: '#0A7AFF',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 14,
  },
  info: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 12,
    fontWeight: '500',
  },
  footer: {
    marginTop: 14,
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mediaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
