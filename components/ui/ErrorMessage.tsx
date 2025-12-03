/**
 * Mensaje de error reutilizable
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorMessage({ message, onRetry, style }: ErrorMessageProps) {
  return (
    <View style={[styles.container, style]}>
      <AlertCircle size={48} color="#FF3B30" />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Reintentar"
          onPress={onRetry}
          variant="outline"
          style={styles.retryButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
  },
});
