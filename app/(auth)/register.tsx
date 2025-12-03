/**
 * Pantalla de Registro
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'surfer' | 'photographer'>('surfer');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
    } catch (err) {
      // El error ya se maneja en el contexto
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert(
      'Próximamente',
      'El registro con Google estará disponible pronto'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a la comunidad de surfers y fotógrafos
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={errors.confirmPassword}
          />

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Quiero registrarme como:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'surfer' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('surfer')}>
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'surfer' && styles.roleButtonTextActive,
                  ]}>
                  Surfer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'photographer' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('photographer')}>
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'photographer' && styles.roleButtonTextActive,
                  ]}>
                  Fotógrafo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Crear Cuenta"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continuar con Google"
            onPress={handleGoogleRegister}
            variant="outline"
            disabled={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  form: {
    marginBottom: 24,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  roleButtonTextActive: {
    color: '#007AFF',
  },
  registerButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#8E8E93',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
});
