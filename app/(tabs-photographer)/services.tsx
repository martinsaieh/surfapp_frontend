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
import { Plus, Edit2, Trash2, X } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api-supabase';
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
      const { data, error: fetchError } = await api.supabase
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
        const { error: updateError } = await api.supabase
          .from('photographer_services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await api.supabase
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
            const { error } = await api.supabase
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
        <Text style={styles.serviceName}>{item.name}</Text>
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
        <Text style={styles.servicePrice}>
          {item.currency} {item.price.toFixed(2)}
        </Text>
        <Text style={styles.serviceDuration}>{item.duration_hours}h</Text>
      </View>

      {item.features && item.features.length > 0 && (
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>
              • {feature}
            </Text>
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Servicios</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {error && <ErrorMessage message={error} onRetry={loadServices} />}

      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  serviceDuration: {
    fontSize: 16,
    color: '#8E8E93',
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  featureItem: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
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
