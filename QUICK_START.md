# SurfApp - Guía de Inicio Rápido

## Resumen Ejecutivo

**SurfApp** es una aplicación móvil profesional que conecta surfers con fotógrafos. Este frontend está construido con:

- ✅ **React Native + Expo SDK 54**
- ✅ **TypeScript** completo
- ✅ **Expo Router** (navegación por archivos)
- ✅ **Autenticación** con JWT
- ✅ **Cliente API** para FastAPI backend
- ✅ **Componentes reutilizables**
- ✅ **Código modular y escalable**

## Inicio en 5 Pasos

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Backend

Edita `.env` con la URL de tu backend FastAPI:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

**Para dispositivos móviles**, usa la IP de tu máquina:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

### 4. Abrir la App

- **Web**: Presiona `w` en la terminal
- **iOS Simulator** (macOS): Presiona `i`
- **Android Emulator**: Presiona `a`
- **Dispositivo Físico**: Escanea el QR con Expo Go

### 5. Probar la Aplicación

1. La app abrirá en la pantalla de login
2. Crea una cuenta con email/password
3. Explora fotógrafos
4. Crea una reserva
5. Ve tus sesiones

## Pantallas Implementadas

### Autenticación
- ✅ Login con email/password
- ✅ Registro de usuario (surfer/photographer)
- ✅ Persistencia de sesión
- ✅ Redirección automática

### Principal (Tabs)
- ✅ **Home**: Búsqueda de fotógrafos por spot
- ✅ **Sesiones**: Lista de sesiones (programadas, en progreso, completadas)
- ✅ **Perfil**: Información del usuario y almacenamiento

### Detalle
- ✅ **Fotógrafo**: Perfil completo, portfolio, spots, precios
- ✅ **Sesión**: Fotos/videos, condiciones del mar, bitácora

## Estructura de Carpetas

```
app/                    # Rutas (Expo Router)
├── (auth)/            # Login, Registro
├── (tabs)/            # Home, Sesiones, Perfil
└── photographers/     # Detalle de fotógrafo

components/            # Componentes reutilizables
├── ui/               # Button, Input, Loading, Error
└── cards/            # PhotographerCard, SessionCard, MediaGrid

lib/                  # Lógica de negocio
├── api.ts           # Cliente API
├── auth.ts          # Persistencia
├── types.ts         # Tipos TypeScript
└── upload.ts        # Subida de archivos

context/             # Estado global
└── AuthContext.tsx  # Autenticación
```

## API Client

### Ejemplo de Uso

```typescript
import api from '@/lib/api';

// Listar fotógrafos
const photographers = await api.getPhotographers({
  spot: 'Playa Norte',
  available_only: true
});

// Crear reserva
const booking = await api.createBooking({
  photographer_id: 'photo-123',
  spot: 'Playa Norte',
  date: '2024-01-15',
  time: '08:00',
  duration_hours: 2
});

// Obtener sesiones
const sessions = await api.getMySessions();
```

## Componentes Principales

### Button

```typescript
import { Button } from '@/components/ui/Button';

<Button
  title="Reservar"
  onPress={handleBooking}
  loading={isLoading}
  variant="primary"
/>
```

### Input

```typescript
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
/>
```

### PhotographerCard

```typescript
import { PhotographerCard } from '@/components/cards/PhotographerCard';

<PhotographerCard
  photographer={photographer}
  onPress={() => router.push(`/photographers/${photographer.id}`)}
/>
```

## Autenticación

### Context de Auth

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login({ email, password });
    // Redirige automáticamente a home
  };

  return <>{user ? <Text>{user.name}</Text> : <LoginForm />}</>;
}
```

### Rutas Protegidas

El `AuthContext` protege automáticamente las rutas:
- Si **NO** estás logueado → redirige a `/login`
- Si **SÍ** estás logueado → redirige a `/home`

## Scripts Útiles

```bash
# Desarrollo
npm run dev

# TypeCheck
npm run typecheck

# Build Web
npm run build:web
```

## Troubleshooting

### Backend no responde

```bash
# Verifica que el backend esté corriendo
curl http://localhost:8000/api/photographers

# Si usas dispositivo móvil, usa IP de tu máquina
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### Errores de TypeScript

```bash
# Verificar errores
npm run typecheck

# Reiniciar TypeScript server en VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Caché de Expo

```bash
# Limpiar caché y reiniciar
npx expo start -c
```

### No se ve la app en el dispositivo

1. Asegúrate de estar en la misma red WiFi
2. Verifica que el firewall permita conexiones al puerto 8081
3. Usa Expo Go app actualizada

## Siguientes Pasos

### Funcionalidades por Implementar

- [ ] Autenticación con Google OAuth
- [ ] Chat en tiempo real
- [ ] Push notifications
- [ ] Sistema de reviews
- [ ] Edición de perfil completa
- [ ] Filtros avanzados
- [ ] Modo offline

### Mejoras Técnicas

- [ ] Tests unitarios (Jest)
- [ ] Tests E2E (Detox)
- [ ] React Query para cache
- [ ] Internacionalización (i18n)
- [ ] Tema oscuro
- [ ] Analytics

## Documentación Completa

- **README.md** - Documentación general
- **PROJECT_STRUCTURE.md** - Estructura del proyecto
- **docs/ARCHITECTURE.md** - Arquitectura detallada
- **docs/API_INTEGRATION.md** - Guía de integración con API

## Endpoints del Backend

El frontend consume estos endpoints:

### Autenticación
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Usuario actual

### Fotógrafos
- `GET /photographers` - Listar
- `GET /photographers/{id}` - Obtener uno

### Reservas
- `POST /bookings` - Crear
- `GET /bookings/me` - Mis reservas

### Sesiones
- `GET /surfers/sessions` - Mis sesiones
- `GET /sessions/{id}` - Detalle
- `GET /sessions/{id}/media` - Media

### Almacenamiento
- `GET /me/storage-usage` - Uso de storage

## Demo de Flujo Completo

1. **Registro**:
   - Abrir app → Pantalla de login
   - Click "Regístrate"
   - Ingresar nombre, email, password
   - Seleccionar rol (Surfer)
   - Click "Crear Cuenta"
   - ✅ Redirige automáticamente a Home

2. **Buscar Fotógrafo**:
   - Home muestra lista de fotógrafos
   - Usar buscador para filtrar por spot
   - Click en un fotógrafo
   - ✅ Abre perfil completo

3. **Crear Reserva**:
   - En perfil de fotógrafo
   - Click "Reservar Sesión"
   - Ingresar detalles
   - ✅ Reserva creada

4. **Ver Sesiones**:
   - Tab "Sesiones"
   - Lista de todas las sesiones
   - Filtrar por estado
   - Click en una sesión
   - ✅ Ver fotos, videos, bitácora

5. **Ver Perfil**:
   - Tab "Perfil"
   - Ver información personal
   - Ver uso de almacenamiento
   - Cerrar sesión

## Tecnologías Usadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Expo | 54.0.10 | Framework base |
| React Native | 0.81.4 | UI components |
| TypeScript | 5.9.2 | Type safety |
| Expo Router | 6.0.8 | Navegación |
| AsyncStorage | 2.2.0 | Persistencia |
| Lucide Icons | 0.544.0 | Iconografía |

## Contacto

Para reportar bugs o solicitar features:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

---

**¡Listo para empezar!** 🏄‍♂️📸

Ejecuta `npm run dev` y comienza a desarrollar.
