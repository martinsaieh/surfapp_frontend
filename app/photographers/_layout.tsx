/**
 * Layout para rutas de fotógrafos
 */

import { Stack } from 'expo-router';

export default function PhotographersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
