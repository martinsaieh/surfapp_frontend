/**
 * Card para mostrar información de fotógrafo
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
import { MapPin, Star, Camera, Award } from 'lucide-react-native';
import { Photographer } from '@/lib/types';
import { useRouter } from 'expo-router';

interface PhotographerCardProps {
  photographer: Photographer;
  style?: ViewStyle;
  onPress?: () => void;
}

export function PhotographerCard({
  photographer,
  style,
  onPress,
}: PhotographerCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/photographers/${photographer.id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              photographer.avatar ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          }}
          style={styles.avatar}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />
        {photographer.available && (
          <View style={styles.availableBadge}>
            <View style={styles.availableDot} />
            <Text style={styles.availableText}>Disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {photographer.name}
          </Text>
          <View style={styles.rating}>
            <Star size={14} color="#FF9500" fill="#FF9500" />
            <Text style={styles.ratingText}>
              {photographer.rating.toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.spots}>
          <MapPin size={14} color="#0A7AFF" />
          <Text style={styles.spotsText} numberOfLines={1}>
            {photographer.spots.join(' • ')}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>
              {photographer.currency} {photographer.price_per_session}
            </Text>
            <Text style={styles.priceLabel}>por sesión</Text>
          </View>
          <View style={styles.stats}>
            <Camera size={14} color="#8E8E93" />
            <Text style={styles.statsText}>
              {photographer.experience_years || 0} años
            </Text>
            <Award size={14} color="#8E8E93" style={{ marginLeft: 8 }} />
            <Text style={styles.statsText}>
              {photographer.reviews_count}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  availableBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  availableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9500',
    marginLeft: 4,
  },
  spots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spotsText: {
    fontSize: 13,
    color: '#3C3C43',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  priceContainer: {
    flex: 1,
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0A7AFF',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
});
