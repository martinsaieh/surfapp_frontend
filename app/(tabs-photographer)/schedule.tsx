import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

const SPOTS = [
  'Punta de Lobos',
  'La Puntilla',
  'Infiernillo',
  'Otra playa…',
];

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export default function ScheduleScreen() {
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<{ [key: string]: boolean }>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');

  const toggleSpot = (spot: string) => {
    if (selectedSpots.includes(spot)) {
      setSelectedSpots(selectedSpots.filter((s) => s !== spot));
    } else {
      setSelectedSpots([...selectedSpots, spot]);
    }
  };

  const toggleDay = (dayKey: string) => {
    setWorkingDays({
      ...workingDays,
      [dayKey]: !workingDays[dayKey],
    });
  };

  const handleSave = () => {
    const availability = {
      spots: selectedSpots,
      workingDays: workingDays,
      schedule: {
        startTime,
        endTime,
      },
    };

    console.log('Disponibilidad guardada (solo local):', availability);
    Alert.alert('Disponibilidad guardada (solo local)', JSON.stringify(availability, null, 2));
  };

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
                Define en qué spots trabajas y en qué horarios estás disponible
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#0A7AFF" />
            <Text style={styles.sectionTitle}>Spots donde trabajas</Text>
          </View>
          <View style={styles.sectionContent}>
            {SPOTS.map((spot) => {
              const isSelected = selectedSpots.includes(spot);
              return (
                <TouchableOpacity
                  key={spot}
                  style={[styles.spotItem, isSelected && styles.spotItemSelected]}
                  onPress={() => toggleSpot(spot)}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={[styles.spotText, isSelected && styles.spotTextSelected]}>
                    {spot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={20} color="#0A7AFF" />
            <Text style={styles.sectionTitle}>Días de la semana</Text>
          </View>
          <View style={styles.sectionContent}>
            {DAYS.map((day) => (
              <View key={day.key} style={styles.dayItem}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Switch
                  value={workingDays[day.key]}
                  onValueChange={() => toggleDay(day.key)}
                  trackColor={{ false: '#E5E5EA', true: '#0A7AFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#0A7AFF" />
            <Text style={styles.sectionTitle}>Horario general</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Hora de inicio</Text>
              <TextInput
                style={styles.timeInput}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM"
                placeholderTextColor="#8E8E93"
              />
            </View>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeLabel}>Hora de término</Text>
              <TextInput
                style={styles.timeInput}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Guardar disponibilidad"
            onPress={handleSave}
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
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginLeft: 12,
  },
  sectionContent: {
    padding: 16,
  },
  spotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  spotItemSelected: {
    backgroundColor: '#E3F2FF',
    borderColor: '#0A7AFF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A7AFF',
    borderColor: '#0A7AFF',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  spotText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
    fontWeight: '500',
  },
  spotTextSelected: {
    color: '#0A7AFF',
    fontWeight: '600',
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dayLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  footer: {
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  saveButton: {
    marginBottom: 20,
  },
});
