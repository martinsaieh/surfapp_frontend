# Arquitectura del Frontend

Documento técnico sobre la arquitectura y decisiones de diseño de SurfApp Frontend.

## Resumen

SurfApp Frontend es una aplicación React Native construida con Expo y TypeScript que sigue un patrón de arquitectura modular y basada en componentes. La aplicación consume una API REST FastAPI y gestiona estado local con React Context y hooks.

## Stack Tecnológico

### Core
- **React Native 0.81.4** - Framework principal
- **Expo SDK 54** - Tooling y componentes nativos
- **TypeScript 5.9** - Tipado estático
- **Expo Router 6** - Navegación basada en archivos

### Librerías Principales
- **@react-native-async-storage/async-storage** - Persistencia local
- **lucide-react-native** - Iconografía
- **react-native-gesture-handler** - Gestos nativos
- **react-native-reanimated** - Animaciones de alto rendimiento

## Estructura de Carpetas

```
project/
├── app/                      # Rutas de la aplicación (Expo Router)
│   ├── (auth)/              # Grupo de rutas de autenticación
│   ├── (tabs)/              # Navegación principal con tabs
│   ├── photographers/       # Rutas dinámicas de fotógrafos
│   ├── index.tsx           # Punto de entrada
│   └── _layout.tsx         # Layout raíz con providers
├── components/              # Componentes reutilizables
│   ├── ui/                 # Componentes base (Button, Input, etc)
│   └── cards/              # Componentes de tarjetas
├── context/                # React Context providers
├── lib/                    # Lógica de negocio y utilidades
├── hooks/                  # Custom hooks
├── types/                  # Definiciones de tipos TypeScript
└── assets/                 # Recursos estáticos
```

## Capas de la Aplicación

### 1. Capa de Presentación (UI)

**Responsabilidad**: Renderizar componentes visuales y manejar interacción del usuario.

**Ubicación**: `app/`, `components/`

**Patrones**:
- Componentes funcionales con hooks
- Props tipadas con TypeScript
- Composición de componentes
- Separation of Concerns (presentacional vs. contenedor)

**Ejemplo**:
```typescript
// Componente presentacional
interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export function Button({ title, onPress, loading }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}
```

### 2. Capa de Lógica de Negocio

**Responsabilidad**: Gestionar estado, reglas de negocio y flujos de la aplicación.

**Ubicación**: `lib/`, `context/`, `hooks/`

**Patrones**:
- Context API para estado global
- Custom hooks para lógica reutilizable
- Service layer para interacción con API

**Ejemplo**:
```typescript
// Context para autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginRequest) => {
    const response = await api.login(credentials);
    setUser(response.user);
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. Capa de Datos

**Responsabilidad**: Comunicación con backend y persistencia local.

**Ubicación**: `lib/api.ts`, `lib/auth.ts`

**Patrones**:
- Cliente API centralizado
- Abstracción de storage
- Type-safe requests/responses

**Ejemplo**:
```typescript
// Cliente API
class ApiClient {
  async getPhotographers(filters?: PhotographerFilters): Promise<Photographer[]> {
    return this.request<Photographer[]>('/photographers', {
      method: 'GET'
    });
  }
}
```

## Patrones de Diseño

### 1. Provider Pattern

Usado para compartir estado global (autenticación, temas, etc).

```typescript
<AuthProvider>
  <App />
</AuthProvider>
```

### 2. Compound Components

Para componentes complejos con múltiples partes.

```typescript
<MediaGrid media={photos}>
  <MediaGrid.Item />
  <MediaGrid.EmptyState />
</MediaGrid>
```

### 3. Render Props (limitado)

Para casos específicos donde se necesita control total del renderizado.

### 4. Higher-Order Components (evitado)

Preferimos hooks sobre HOCs para mejor composición.

### 5. Custom Hooks

Encapsular lógica reutilizable.

```typescript
function usePhotographer(id: string) {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhotographer();
  }, [id]);

  return { photographer, isLoading };
}
```

## Gestión de Estado

### Estado Local

Para estado específico de un componente:

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

### Estado Global (Context)

Para estado compartido entre múltiples componentes:

```typescript
// AuthContext
const { user, isAuthenticated, login, logout } = useAuth();
```

### Estado Persistente

Para datos que deben sobrevivir al cierre de la app:

```typescript
// AsyncStorage
await authStorage.saveToken(token);
const token = await authStorage.getToken();
```

### Estado del Servidor

Data fetched del backend se gestiona localmente:

```typescript
const [photographers, setPhotographers] = useState<Photographer[]>([]);

useEffect(() => {
  api.getPhotographers().then(setPhotographers);
}, []);
```

**Nota**: Para apps más grandes, considerar React Query o SWR para cache y sincronización.

## Navegación

### Expo Router (File-based routing)

La navegación se define por la estructura de carpetas:

```
app/
├── (auth)/
│   ├── login.tsx          → /(auth)/login
│   └── register.tsx       → /(auth)/register
├── (tabs)/
│   ├── home.tsx           → /(tabs)/home
│   └── sessions/
│       ├── index.tsx      → /(tabs)/sessions
│       └── [id].tsx       → /(tabs)/sessions/:id
└── photographers/
    └── [id].tsx           → /photographers/:id
```

### Navegación Protegida

El `AuthContext` gestiona automáticamente la navegación basada en autenticación:

```typescript
useEffect(() => {
  if (!user && !inAuthGroup) {
    router.replace('/(auth)/login');
  } else if (user && inAuthGroup) {
    router.replace('/(tabs)/home');
  }
}, [user, segments]);
```

### Tipos de Navegación

1. **Stack**: Navegación jerárquica (push/pop)
2. **Tabs**: Navegación entre secciones principales
3. **Modal**: Overlays temporales
4. **Deep Linking**: Navegación desde URLs externas

## Manejo de Errores

### Niveles de Error

1. **Errores de Red**: Timeout, sin conexión
2. **Errores de API**: 4xx, 5xx
3. **Errores de Validación**: Input inválido
4. **Errores de Estado**: Estado inconsistente

### Estrategia de Manejo

```typescript
try {
  const data = await api.getPhotographers();
  setPhotographers(data);
  setError(null);
} catch (err: any) {
  setError(err.message);
  // Log a servicio de monitoreo si aplica
  console.error('Error loading photographers:', err);
}
```

### UI de Errores

```typescript
// Mostrar en UI, no usar Alert
{error && (
  <ErrorMessage
    message={error}
    onRetry={loadPhotographers}
  />
)}
```

## Seguridad

### Tokens JWT

- Almacenados en AsyncStorage (seguro en móvil)
- Incluidos automáticamente en headers
- Validados en el backend

### Validación de Input

```typescript
function validateEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}
```

### Sanitización de Datos

```typescript
// Limpiar input antes de enviar
const cleanEmail = email.trim().toLowerCase();
```

### HTTPS en Producción

Todas las comunicaciones deben usar HTTPS en producción.

## Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: Cargar componentes bajo demanda
2. **Memoization**: `React.memo()` para componentes puros
3. **Virtualized Lists**: `FlatList` para listas largas
4. **Image Optimization**: Usar tamaños apropiados y cache

### Ejemplo de Optimización

```typescript
// Virtualized list para performance
<FlatList
  data={photographers}
  renderItem={({ item }) => <PhotographerCard photographer={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

## Testing

### Estrategia de Testing

1. **Unit Tests**: Lógica de negocio y utilidades
2. **Integration Tests**: Flujos completos
3. **E2E Tests**: Casos de uso principales

### Herramientas Recomendadas

- **Jest**: Unit testing
- **React Native Testing Library**: Component testing
- **Detox**: E2E testing

### Ejemplo de Test

```typescript
describe('api.login', () => {
  it('should return user and token on success', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await api.login(credentials);

    expect(response).toHaveProperty('access_token');
    expect(response).toHaveProperty('user');
  });
});
```

## Convenciones de Código

### Naming

- **Componentes**: PascalCase (e.g., `PhotographerCard`)
- **Funciones**: camelCase (e.g., `loadPhotographers`)
- **Constantes**: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Interfaces**: PascalCase con sufijo Props si aplica (e.g., `ButtonProps`)

### Organización de Imports

```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. React Native
import { View, Text, StyleSheet } from 'react-native';

// 3. Third-party
import { useRouter } from 'expo-router';

// 4. Local components
import { Button } from '@/components/ui/Button';

// 5. Local utilities
import api from '@/lib/api';
import { Photographer } from '@/lib/types';
```

### Estructura de Componentes

```typescript
// 1. Imports
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export function MyComponent({ title }: Props) {
  // 3.1 Hooks
  const [state, setState] = useState();

  // 3.2 Effects
  useEffect(() => {}, []);

  // 3.3 Handlers
  const handlePress = () => {};

  // 3.4 Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Build y Deployment

### Development Build

```bash
npm run dev
```

### Web Build

```bash
npm run build:web
```

### Production Build (React Native)

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Monitoreo y Logging

### Estrategia de Logs

```typescript
// Desarrollo
console.log('[DEBUG]', 'User logged in:', user);

// Producción (usar servicio como Sentry)
Sentry.captureMessage('User logged in', {
  level: 'info',
  user: { id: user.id, email: user.email }
});
```

### Métricas Importantes

- Tiempo de carga de pantallas
- Tasa de error de API calls
- Crashes y exceptions
- Uso de memoria

## Futuras Mejoras

### Corto Plazo

- [ ] Implementar React Query para cache inteligente
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar i18n para múltiples idiomas
- [ ] Agregar tema oscuro

### Mediano Plazo

- [ ] Implementar CodePush para updates OTA
- [ ] Agregar analytics (Firebase, Amplitude)
- [ ] Implementar push notifications
- [ ] Optimizar imágenes con progressive loading

### Largo Plazo

- [ ] Migrar a arquitectura Micro-Frontend
- [ ] Implementar GraphQL en lugar de REST
- [ ] Agregar modo offline con sincronización
- [ ] Implementar Web Sockets para real-time

## Referencias

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
