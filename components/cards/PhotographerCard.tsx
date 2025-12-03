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
import { MapPin, Star, Camera } from 'lucide-react-native';
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
      activeOpacity={0.7}>
      <Image
        source={{
          uri:
            photographer.avatar ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        }}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{photographer.name}</Text>
          {photographer.available && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>Disponible</Text>
            </View>
          )}
        </View>

        <View style={styles.rating}>
          <Star size={16} color="#FF9500" fill="#FF9500" />
          <Text style={styles.ratingText}>
            {photographer.rating.toFixed(1)} ({photographer.reviews_count}{' '}
            reseñas)
          </Text>
        </View>

        <View style={styles.spots}>
          <MapPin size={14} color="#8E8E93" />
          <Text style={styles.spotsText} numberOfLines={1}>
            {photographer.spots.join(', ')}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.price}>
            <Text style={styles.priceAmount}>
              {photographer.currency} {photographer.price_per_session}
            </Text>
            <Text style={styles.priceLabel}>/sesión</Text>
          </View>
          <View style={styles.experience}>
            <Camera size={14} color="#8E8E93" />
            <Text style={styles.experienceText}>
              {photographer.experience_years || 0} años
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  availableBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
  },
  spots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotsText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
});
