/**
 * Pantalla de perfil del usuario
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
} from 'react-native';
import {
  User as UserIcon,
  Mail,
  Phone,
  HardDrive,
  LogOut,
  Calendar,
  Camera,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { StorageUsage } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProfileScreen() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageUsage();
  }, []);

  const loadStorageUsage = async () => {
    try {
      const data = await api.getStorageUsage();
      setStorageUsage(data);
    } catch (err) {
      console.error('Error loading storage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user.avatar ||
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user.role === 'surfer' ? 'Surfer' : 'Fotógrafo'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            {user.phone && (
              <View style={styles.infoRow}>
                <Phone size={20} color="#8E8E93" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{user.phone}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Calendar size={20} color="#8E8E93" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Miembro desde</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {storageUsage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Almacenamiento</Text>
            <View style={styles.storageCard}>
              <View style={styles.storageHeader}>
                <HardDrive size={24} color="#007AFF" />
                <View style={styles.storageInfo}>
                  <Text style={styles.storagePlan}>{storageUsage.plan}</Text>
                  <Text style={styles.storageText}>
                    {storageUsage.used_gb.toFixed(1)} GB de{' '}
                    {storageUsage.total_gb} GB usados
                  </Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${storageUsage.percentage}%` },
                  ]}
                />
              </View>

              <Text style={styles.storagePercentage}>
                {storageUsage.percentage.toFixed(0)}% utilizado
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            loading={authLoading}
            disabled={authLoading}
          />
        </View>

        <Text style={styles.version}>SurfApp v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 32,
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storagePlan: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  storageText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  storagePercentage: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'right',
  },
  version: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },
});
