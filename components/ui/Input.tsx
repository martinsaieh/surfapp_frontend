/**
 * Campo de entrada reutilizable
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: any;
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholderTextColor="#8E8E93"
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure(!isSecure)}>
            {isSecure ? (
              <EyeOff size={20} color="#8E8E93" />
            ) : (
              <Eye size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
});
