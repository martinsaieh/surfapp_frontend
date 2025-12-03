/**
 * Pantalla principal - Búsqueda de fotógrafos
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Waves } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api-supabase';
import { Photographer } from '@/lib/types';
import { PhotographerCard } from '@/components/cards/PhotographerCard';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function HomeScreen() {
  const { user } = useAuth();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [filteredPhotographers, setFilteredPhotographers] = useState<
    Photographer[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPhotographers();
  }, []);

  useEffect(() => {
    filterPhotographers();
  }, [searchQuery, photographers]);

  const loadPhotographers = async () => {
    try {
      setError(null);
      const data = await api.getPhotographers();
      setPhotographers(data);
      setFilteredPhotographers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar fotógrafos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterPhotographers = () => {
    if (!searchQuery.trim()) {
      setFilteredPhotographers(photographers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = photographers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.spots.some((spot) => spot.toLowerCase().includes(query))
    );
    setFilteredPhotographers(filtered);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPhotographers();
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando fotógrafos..." />;
  }

  if (error && photographers.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadPhotographers} />
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
          <View style={styles.headerContent}>
            <Waves size={32} color="#FFFFFF" strokeWidth={2.5} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                Hola, {user?.name.split(' ')[0] || 'Surfer'}!
              </Text>
              <Text style={styles.title}>Pichilemu</Text>
              <Text style={styles.subtitle}>Encuentra tu fotógrafo</Text>
            </View>
          </View>

          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#0A7AFF" style={styles.searchIcon} />
              <Input
                placeholder="Buscar por nombre o spot..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                containerStyle={styles.searchInput}
                style={styles.searchInputText}
              />
            </View>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredPhotographers}
        renderItem={({ item }) => <PhotographerCard photographer={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0A7AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Waves size={48} color="#D1D1D6" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No se encontraron fotógrafos con ese criterio'
                : 'No hay fotógrafos disponibles'}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '400',
  },
  searchWrapper: {
    paddingHorizontal: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  searchInputText: {
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingTop: 20,
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
