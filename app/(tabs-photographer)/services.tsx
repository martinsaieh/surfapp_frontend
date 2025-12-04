import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_hours: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export default function ServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    duration_hours: '2',
    features: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('photographer_services')
        .select('*')
        .eq('photographer_id', user.id)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setServices(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      duration_hours: '2',
      features: '',
    });
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      currency: service.currency,
      duration_hours: service.duration_hours.toString(),
      features: service.features.join('\n'),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !formData.name || !formData.price) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      const serviceData = {
        photographer_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        duration_hours: parseInt(formData.duration_hours) || 2,
        features: formData.features
          .split('\n')
          .filter((f) => f.trim())
          .map((f) => f.trim()),
        is_active: true,
        sort_order: editingService ? editingService.sort_order : services.length,
      };

      if (editingService) {
        const { error: updateError } = await supabase
          .from('photographer_services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('photographer_services')
          .insert([serviceData]);

        if (insertError) throw insertError;
      }

      setShowModal(false);
      loadServices();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el servicio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    Alert.alert('Confirmar', '¿Eliminar este servicio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('photographer_services')
              .delete()
              .eq('id', serviceId);

            if (error) throw error;
            loadServices();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceHeaderLeft}>
          <Text style={styles.serviceName}>{item.name}</Text>
          {item.is_active && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Activo</Text>
            </View>
          )}
        </View>
        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openEditModal(item)}>
            <Edit2 size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleDelete(item.id)}>
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {item.description && (
        <Text style={styles.serviceDescription}>{item.description}</Text>
      )}

      <View style={styles.serviceDetails}>
        <View style={styles.priceContainer}>
          <Text style={styles.servicePrice}>
            ${item.price.toFixed(2)}
          </Text>
          <Text style={styles.currency}>{item.currency}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Text style={styles.serviceDuration}>{item.duration_hours} horas</Text>
        </View>
      </View>

      {item.features && item.features.length > 0 && (
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Incluye:</Text>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner message="Cargando servicios..." />;
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
            <Package size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Mis Servicios</Text>
              <Text style={styles.headerSubtitle}>
                {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Plus size={24} color="#0A7AFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {error && <ErrorMessage message={error} onRetry={loadServices} />}

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={64} color="#E5E5EA" />
            <Text style={styles.emptyText}>
              No tienes servicios creados aún
            </Text>
            <Text style={styles.emptySubtext}>
              Crea servicios para que los surfers puedan reservar contigo
            </Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ej: Básico, Premium, Platino"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Describe tu servicio"
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Precio *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.price}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: text })
                    }
                    placeholder="50.00"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Duración (horas)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.duration_hours}
                    onChangeText={(text) =>
                      setFormData({ ...formData, duration_hours: text })
                    }
                    placeholder="2"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Características</Text>
              <Text style={styles.hint}>Una por línea</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.features}
                onChangeText={(text) =>
                  setFormData({ ...formData, features: text })
                }
                placeholder={'50 fotos editadas\nEntrega en 48h\nAcceso a galería privada'}
                multiline
                numberOfLines={5}
              />

              <Button
                title={editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                onPress={handleSave}
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
  headerGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    padding: 16,
    paddingTop: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  activeBadge: {
    backgroundColor: '#34C75920',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  serviceDescription: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 16,
    lineHeight: 22,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  servicePrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0A7AFF',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  durationContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A7AFF',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#3C3C43',
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 20,
  },
});
