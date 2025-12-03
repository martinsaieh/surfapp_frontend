/**
 * Pantalla de detalle de fotógrafo
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Star,
  Camera,
  DollarSign,
  Award,
  Calendar,
} from 'lucide-react-native';
import api from '@/lib/api-supabase';
import { Photographer, CreateBookingRequest } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const { width } = Dimensions.get('window');

export default function PhotographerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPhotographer();
    }
  }, [id]);

  const loadPhotographer = async () => {
    try {
      setError(null);
      const data = await api.getPhotographer(id!);
      setPhotographer(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar fotógrafo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = () => {
    if (!photographer) return;

    Alert.alert(
      'Reservar Sesión',
      `¿Deseas reservar una sesión con ${photographer.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => showBookingForm(),
        },
      ]
    );
  };

  const showBookingForm = () => {
    Alert.prompt(
      'Reservar Sesión',
      'Ingresa los detalles de tu reserva:',
      async (text) => {
        if (text) {
          await createBooking(text);
        }
      },
      'plain-text',
      'Spot de surf'
    );
  };

  const createBooking = async (spot: string) => {
    if (!photographer) return;

    try {
      setIsBooking(true);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookingData: CreateBookingRequest = {
        photographer_id: photographer.id,
        spot: spot || photographer.spots[0],
        date: tomorrow.toISOString().split('T')[0],
        time: '08:00',
        duration_hours: 2,
        notes: 'Reserva desde la app',
      };

      const booking = await api.createBooking(bookingData);

      Alert.alert(
        'Reserva Exitosa',
        `Tu sesión con ${photographer.name} ha sido reservada.`,
        [
          {
            text: 'Ver Sesiones',
            onPress: () => router.push('/(tabs)/sessions'),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la reserva');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando fotógrafo..." />;
  }

  if (error || !photographer) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          message={error || 'Fotógrafo no encontrado'}
          onRetry={loadPhotographer}
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{
            uri:
              photographer.avatar ||
              'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          }}
          style={styles.banner}
        />

        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{photographer.name}</Text>
              {photographer.available && (
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>Disponible</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={20} color="#FF9500" fill="#FF9500" />
              <Text style={styles.statValue}>
                {photographer.rating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>
                {photographer.reviews_count} reseñas
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Camera size={20} color="#007AFF" />
              <Text style={styles.statValue}>
                {photographer.experience_years || 0}
              </Text>
              <Text style={styles.statLabel}>años de exp.</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <MapPin size={20} color="#34C759" />
              <Text style={styles.statValue}>{photographer.spots.length}</Text>
              <Text style={styles.statLabel}>spots</Text>
            </View>
          </View>
        </View>

        {photographer.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{photographer.bio}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spots donde trabajo</Text>
          <View style={styles.spotsContainer}>
            {photographer.spots.map((spot, index) => (
              <View key={index} style={styles.spotChip}>
                <MapPin size={14} color="#007AFF" />
                <Text style={styles.spotText}>{spot}</Text>
              </View>
            ))}
          </View>
        </View>

        {photographer.equipment && photographer.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipo</Text>
            {photographer.equipment.map((item, index) => (
              <View key={index} style={styles.equipmentItem}>
                <Camera size={16} color="#8E8E93" />
                <Text style={styles.equipmentText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {photographer.portfolio_images &&
          photographer.portfolio_images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Portfolio</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioContainer}>
                {photographer.portfolio_images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.portfolioImage}
                  />
                ))}
              </ScrollView>
            </View>
          )}

        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Precio por sesión</Text>
            <View style={styles.priceRow}>
              <DollarSign size={24} color="#007AFF" />
              <Text style={styles.priceAmount}>
                {photographer.currency} {photographer.price_per_session}
              </Text>
            </View>
          </View>
          <Button
            title="Reservar Sesión"
            onPress={handleBooking}
            loading={isBooking}
            disabled={isBooking || !photographer.available}
            style={styles.bookButton}
          />
        </View>
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
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  banner: {
    width: width,
    height: 250,
    backgroundColor: '#F2F2F7',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75920',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  spotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  spotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF10',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  spotText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    color: '#3C3C43',
    marginLeft: 8,
  },
  portfolioContainer: {
    gap: 12,
  },
  portfolioImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  priceSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  priceInfo: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    marginLeft: 4,
  },
  bookButton: {
    width: '100%',
  },
});
