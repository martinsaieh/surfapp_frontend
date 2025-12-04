import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Check, Calendar as CalendarIcon } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';

interface Schedule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

const TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<{ [key: string]: Schedule[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('photographer_schedules')
        .select('*')
        .eq('photographer_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      const grouped: { [key: string]: Schedule[] } = {};
      (data || []).forEach((schedule: any) => {
        const key = `${schedule.day_of_week}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(schedule);
      });

      setSchedules(grouped);
    } catch (err: any) {
      setError(err.message || 'Error al cargar horarios');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTimeSlot = (dayIndex: number, time: string) => {
    const key = `${dayIndex}`;
    const daySchedules = schedules[key] || [];
    const existingIndex = daySchedules.findIndex(
      (s) => s.start_time === time
    );

    const newSchedules = { ...schedules };

    if (existingIndex >= 0) {
      newSchedules[key] = daySchedules.filter((_, i) => i !== existingIndex);
      if (newSchedules[key].length === 0) delete newSchedules[key];
    } else {
      const [hour] = time.split(':');
      const endHour = (parseInt(hour) + 1).toString().padStart(2, '0');
      const endTime = `${endHour}:00`;

      const newSlot: Schedule = {
        day_of_week: dayIndex,
        start_time: time,
        end_time: endTime,
        is_available: true,
      };

      if (!newSchedules[key]) newSchedules[key] = [];
      newSchedules[key] = [...newSchedules[key], newSlot].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );
    }

    setSchedules(newSchedules);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await supabase
        .from('photographer_schedules')
        .delete()
        .eq('photographer_id', user.id);

      const allSchedules = Object.values(schedules).flat();
      if (allSchedules.length > 0) {
        const schedulesData = allSchedules.map((schedule) => ({
          photographer_id: user.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_available: schedule.is_available,
        }));

        const { error: insertError } = await supabase
          .from('photographer_schedules')
          .insert(schedulesData);

        if (insertError) throw insertError;
      }

      Alert.alert('Éxito', 'Horarios guardados correctamente');
      loadSchedules();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron guardar los horarios');
    } finally {
      setIsSaving(false);
    }
  };

  const isSlotSelected = (dayIndex: number, time: string) => {
    const key = `${dayIndex}`;
    const daySchedules = schedules[key] || [];
    return daySchedules.some((s) => s.start_time === time);
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando horarios..." />;
  }

  const totalSlots = Object.values(schedules).reduce((sum, day) => sum + day.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A7AFF', '#00C6FB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <CalendarIcon size={32} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Disponibilidad</Text>
              <Text style={styles.headerSubtitle}>
                {totalSlots} {totalSlots === 1 ? 'horario' : 'horarios'} configurados
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {error && <ErrorMessage message={error} onRetry={loadSchedules} />}

      <ScrollView style={styles.content}>
        <View style={styles.instructionCard}>
          <Clock size={24} color="#0A7AFF" />
          <View style={styles.instructionText}>
            <Text style={styles.instructionTitle}>Selecciona tus horarios</Text>
            <Text style={styles.instructionSubtitle}>
              Toca para activar/desactivar los horarios en los que estás disponible
            </Text>
          </View>
        </View>

        {DAYS.map((day, dayIndex) => {
          const daySlots = schedules[`${dayIndex}`] || [];
          return (
            <View key={dayIndex} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{day}</Text>
                {daySlots.length > 0 && (
                  <View style={styles.slotCountBadge}>
                    <Text style={styles.slotCountText}>{daySlots.length}</Text>
                  </View>
                )}
              </View>
              <View style={styles.timeSlots}>
                {TIME_SLOTS.map((time) => {
                  const selected = isSlotSelected(dayIndex, time);
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selected && styles.timeSlotSelected,
                      ]}
                      onPress={() => toggleTimeSlot(dayIndex, time)}>
                      <Text
                        style={[
                          styles.timeSlotText,
                          selected && styles.timeSlotTextSelected,
                        ]}>
                        {time}
                      </Text>
                      {selected && <Check size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Button
            title="Guardar Horarios"
            onPress={handleSave}
            loading={isSaving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  instructionText: {
    flex: 1,
    marginLeft: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  daySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  slotCountBadge: {
    backgroundColor: '#0A7AFF20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A7AFF',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeSlotSelected: {
    backgroundColor: '#0A7AFF',
    borderColor: '#0A7AFF',
    shadowColor: '#0A7AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 20,
  },
});
