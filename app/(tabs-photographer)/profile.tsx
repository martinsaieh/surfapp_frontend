/**
 * Pantalla de perfil del fotógrafo
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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User as UserIcon,
  Mail,
  Phone,
  HardDrive,
  LogOut,
  Calendar,
  Camera,
  Edit3,
  X,
  Briefcase,
  FileText,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api-supabase';
import { supabase } from '@/lib/supabase';
import { StorageUsage } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProfileScreen() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    experience_years: user?.experience_years?.toString() || '0',
    equipment: user?.equipment?.join('\n') || '',
  });

  useEffect(() => {
    loadStorageUsage();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        experience_years: user.experience_years?.toString() || '0',
        equipment: user.equipment?.join('\n') || '',
      });
    }
  }, [user]);

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

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const equipmentArray = formData.equipment
        .split('\n')
        .filter((item) => item.trim())
        .map((item) => item.trim());

      const { error } = await supabase
        .from('users')
        .update({
          bio: formData.bio,
          experience_years: parseInt(formData.experience_years) || 0,
          equipment: equipmentArray,
        })
        .eq('id', user.id);

      if (error) throw error;

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setShowEditModal(false);
      window.location.reload();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={['#0A7AFF', '#00C6FB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}>
            <Edit3 size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    user.avatar ||
                    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Fotógrafo Profesional</Text>
            </View>
          </View>
        </LinearGradient>

        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          </View>
        )}

        {(user.experience_years || user.equipment?.length) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia y Equipo</Text>
            <View style={styles.experienceCard}>
              {user.experience_years && user.experience_years > 0 && (
                <View style={styles.experienceRow}>
                  <View style={styles.iconCircle}>
                    <Briefcase size={20} color="#0A7AFF" />
                  </View>
                  <View style={styles.experienceContent}>
                    <Text style={styles.experienceLabel}>Experiencia</Text>
                    <Text style={styles.experienceValue}>
                      {user.experience_years} {user.experience_years === 1 ? 'año' : 'años'}
                    </Text>
                  </View>
                </View>
              )}

              {user.equipment && user.equipment.length > 0 && (
                <View style={styles.equipmentContainer}>
                  <View style={styles.equipmentHeader}>
                    <Camera size={20} color="#0A7AFF" />
                    <Text style={styles.equipmentTitle}>Mi Equipo</Text>
                  </View>
                  {user.equipment.map((item, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <View style={styles.equipmentDot} />
                      <Text style={styles.equipmentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

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

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Biografía</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="Cuéntanos sobre ti, tu estilo fotográfico..."
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Años de Experiencia</Text>
              <TextInput
                style={styles.input}
                value={formData.experience_years}
                onChangeText={(text) =>
                  setFormData({ ...formData, experience_years: text })
                }
                placeholder="0"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Equipo Fotográfico</Text>
              <Text style={styles.hint}>Un artículo por línea</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.equipment}
                onChangeText={(text) =>
                  setFormData({ ...formData, equipment: text })
                }
                placeholder={'Canon EOS R5\nDJI Drone\nGoPro Hero 11'}
                multiline
                numberOfLines={5}
              />

              <Button
                title="Guardar Cambios"
                onPress={handleSaveProfile}
                loading={isSaving}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingBottom: 32,
  },
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A7AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },
  storageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  storagePlan: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  storageText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A7AFF',
    borderRadius: 5,
  },
  storagePercentage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
    fontWeight: '600',
  },
  version: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
  bioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bioText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A7AFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceContent: {
    marginLeft: 16,
    flex: 1,
  },
  experienceLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  experienceValue: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  equipmentContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 20,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  equipmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A7AFF',
    marginRight: 12,
  },
  equipmentText: {
    fontSize: 15,
    color: '#3C3C43',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});
