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
} from 'react-native';
import { Search } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
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
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hola, {user?.name.split(' ')[0] || 'Surfer'}!
        </Text>
        <Text style={styles.title}>Encuentra tu fotógrafo</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <Input
          placeholder="Buscar por nombre o spot..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPhotographers}
        renderItem={({ item }) => <PhotographerCard photographer={item} />}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
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
