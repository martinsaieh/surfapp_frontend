# Integración con API Backend

Este documento describe cómo el frontend SurfApp se integra con el backend FastAPI.

## Configuración

### Variables de Entorno

Edita el archivo `.env` con la URL de tu backend:

```bash
# Para desarrollo local en navegador
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Para desarrollo en dispositivo físico (usa la IP de tu máquina)
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api

# Para producción
EXPO_PUBLIC_API_URL=https://api.surfapp.com/api
```

### Cliente API

El cliente API está centralizado en `lib/api.ts` y proporciona:

- Gestión automática de tokens JWT
- Timeout configurable
- Manejo de errores estandarizado
- Type-safety completo con TypeScript

## Autenticación

### Flow de Login

```typescript
import api from '@/lib/api';

// 1. Usuario ingresa credenciales
const credentials = {
  email: 'user@example.com',
  password: 'password123'
};

// 2. Llamada a API de login
const response = await api.login(credentials);

// 3. Respuesta del backend
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  token_type: "bearer",
  user: {
    id: "uuid",
    email: "user@example.com",
    name: "Juan Pérez",
    role: "surfer"
  }
}

// 4. Token se guarda automáticamente en AsyncStorage
// 5. Token se incluye en todas las peticiones futuras
```

### Flow de Registro

```typescript
const userData = {
  name: 'Juan Pérez',
  email: 'user@example.com',
  password: 'password123',
  role: 'surfer' // o 'photographer'
};

const response = await api.register(userData);
// Retorna lo mismo que login
```

### Persistencia de Sesión

```typescript
import { authStorage } from '@/lib/auth';

// Guardar token
await authStorage.saveToken(token);

// Recuperar token
const token = await authStorage.getToken();

// Guardar usuario
await authStorage.saveUser(user);

// Recuperar usuario
const user = await authStorage.getUser();

// Limpiar todo
await authStorage.clearAll();
```

## Endpoints Disponibles

### Fotógrafos

#### Listar fotógrafos
```typescript
GET /photographers?spot=Playa+Norte&min_rating=4.5&available_only=true

const photographers = await api.getPhotographers({
  spot: 'Playa Norte',
  min_rating: 4.5,
  available_only: true
});
```

#### Obtener fotógrafo por ID
```typescript
GET /photographers/{id}

const photographer = await api.getPhotographer('photo-id-123');
```

### Reservas (Bookings)

#### Crear reserva
```typescript
POST /bookings

const bookingData = {
  photographer_id: 'photo-id-123',
  spot: 'Playa Norte',
  date: '2024-01-15',
  time: '08:00',
  duration_hours: 2,
  notes: 'Primera sesión de la mañana'
};

const booking = await api.createBooking(bookingData);
```

#### Obtener mis reservas
```typescript
GET /bookings/me

const bookings = await api.getMyBookings();
```

#### Actualizar estado de reserva
```typescript
PATCH /bookings/{id}

await api.updateBookingStatus('booking-id', 'confirmed');
// Estados: 'pending' | 'confirmed' | 'completed' | 'cancelled'
```

### Sesiones

#### Obtener mis sesiones
```typescript
GET /surfers/sessions

const sessions = await api.getMySessions();
```

#### Obtener sesión por ID
```typescript
GET /sessions/{id}

const session = await api.getSession('session-id-123');
```

#### Obtener media de sesión
```typescript
GET /sessions/{id}/media

const media = await api.getSessionMedia('session-id-123');
```

#### Obtener bitácora de sesión
```typescript
GET /sessions/{id}/logs

const logs = await api.getSessionLogs('session-id-123');
```

### Subida de Archivos

#### Flujo completo

```typescript
import { uploadMedia } from '@/lib/upload';

// 1. Usuario selecciona archivo
const file = {
  uri: 'file:///path/to/photo.jpg',
  name: 'surf-photo-001.jpg',
  type: 'image/jpeg'
};

// 2. Subir archivo (maneja presigned URL internamente)
const mediaId = await uploadMedia('session-id-123', file);

// 3. El backend procesa y asocia el archivo a la sesión
```

#### Paso a paso (manual)

```typescript
// 1. Solicitar URL pre-firmada
POST /sessions/{id}/media/presign
{
  filename: "surf-photo-001.jpg",
  content_type: "image/jpeg"
}

// Respuesta:
{
  upload_url: "https://storage.example.com/presigned-url",
  media_id: "media-id-123",
  expires_at: "2024-01-15T10:00:00Z"
}

// 2. Subir archivo a la URL pre-firmada
PUT https://storage.example.com/presigned-url
Content-Type: image/jpeg
Body: [archivo binario]

// 3. El backend procesa automáticamente cuando detecta la subida
```

### Almacenamiento

#### Obtener uso de almacenamiento
```typescript
GET /me/storage-usage

const usage = await api.getStorageUsage();

// Respuesta:
{
  used_bytes: 524288000,
  total_bytes: 5368709120,
  used_gb: 0.5,
  total_gb: 5,
  percentage: 10,
  plan: "Free Plan"
}
```

## Manejo de Errores

### Estructura de Error

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Errores Comunes

```typescript
try {
  await api.login(credentials);
} catch (error: any) {
  switch (error.code) {
    case 'HTTP_401':
      // Credenciales inválidas
      break;
    case 'HTTP_404':
      // Recurso no encontrado
      break;
    case 'HTTP_500':
      // Error del servidor
      break;
    case 'TIMEOUT':
      // Request timeout
      break;
    case 'NETWORK_ERROR':
      // Sin conexión a internet
      break;
    default:
      console.error(error.message);
  }
}
```

### Retry con Exponential Backoff

```typescript
async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
}

// Uso:
const photographers = await retryRequest(() =>
  api.getPhotographers()
);
```

## Headers HTTP

### Request Headers

Todas las peticiones incluyen:

```
Content-Type: application/json
Authorization: Bearer {token}  // Si el usuario está autenticado
```

### Response Headers

El backend debe retornar:

```
Content-Type: application/json
Access-Control-Allow-Origin: *  // Para CORS
```

## Paginación (si aplica)

Si el backend implementa paginación:

```typescript
GET /photographers?page=1&per_page=20

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
```

## Testing con Backend Local

### 1. Iniciar Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Configurar Frontend

```bash
# En .env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Iniciar Frontend

```bash
npm run dev
# Presiona 'w' para web
```

### 4. Verificar Conexión

Abre la consola del navegador y verifica que las peticiones lleguen al backend:

```
Network tab → XHR → Ver peticiones a http://localhost:8000/api
```

## Testing con Dispositivo Físico

### 1. Obtener IP de tu máquina

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### 2. Configurar Frontend

```bash
# En .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### 3. Asegurar Backend acepta conexiones externas

```bash
# Backend debe estar en 0.0.0.0, no en localhost
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Verificar Firewall

Asegúrate de que el puerto 8000 esté abierto en tu firewall.

## Seguridad

### Tokens JWT

- Tokens se almacenan en AsyncStorage (encriptado en iOS, preferencias privadas en Android)
- Tokens expiran según configuración del backend
- Frontend debe manejar refresh de tokens si es necesario

### HTTPS en Producción

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.surfapp.com/api
```

### Validación de Certificados

React Native valida certificados SSL automáticamente en producción.

## Debugging

### Log de peticiones

```typescript
// En lib/api.ts, agregar logging:
console.log('REQUEST:', method, url, body);
console.log('RESPONSE:', status, data);
```

### Inspeccionar con React Native Debugger

1. Instalar [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Abrir el debugger
3. En Expo, presionar `Cmd+D` (iOS) o `Cmd+M` (Android)
4. Seleccionar "Debug Remote JS"

### Network Inspector

En Expo DevTools, habilitar Network Inspector para ver todas las peticiones HTTP.

## Mejores Prácticas

1. **Siempre usar el cliente API centralizado** (`lib/api.ts`)
2. **Nunca hardcodear URLs** - usar variables de entorno
3. **Manejar todos los errores** - UX debe mostrar mensajes claros
4. **Implementar loading states** - feedback visual al usuario
5. **Validar datos antes de enviar** - reducir errores del servidor
6. **Timeout apropiado** - 30 segundos para operaciones normales
7. **Retry en errores de red** - mejorar UX en conexiones inestables
8. **Cache cuando sea posible** - reducir peticiones al backend
