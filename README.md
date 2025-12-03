# SurfApp - Frontend

Aplicación móvil React Native con Expo para conectar surfers con fotógrafos.

## Características

- **Autenticación**: Login y registro con email/password
- **Búsqueda de fotógrafos**: Encuentra fotógrafos por ubicación y especialidad
- **Gestión de sesiones**: Programa, rastrea y revisa tus sesiones de surf
- **Galería de media**: Visualiza fotos y videos de tus sesiones
- **Perfiles de usuario**: Gestiona tu información personal y almacenamiento

## Tecnologías

- **React Native** con **Expo SDK 54**
- **TypeScript** para type-safety completo
- **Expo Router** para navegación basada en archivos
- **AsyncStorage** para persistencia de sesión
- **Lucide Icons** para iconografía
- **FastAPI Backend** (consumido vía REST API)

## Estructura del Proyecto

```
app/
├── (auth)/                 # Rutas de autenticación
│   ├── login.tsx          # Pantalla de login
│   ├── register.tsx       # Pantalla de registro
│   └── _layout.tsx        # Layout de auth
├── (tabs)/                # Navegación principal con tabs
│   ├── home.tsx           # Búsqueda de fotógrafos
│   ├── sessions/          # Gestión de sesiones
│   │   ├── index.tsx      # Lista de sesiones
│   │   ├── [id].tsx       # Detalle de sesión
│   │   └── _layout.tsx
│   ├── profile.tsx        # Perfil del usuario
│   └── _layout.tsx
├── photographers/         # Detalle de fotógrafos
│   ├── [id].tsx          # Perfil de fotógrafo
│   └── _layout.tsx
├── index.tsx             # Pantalla inicial
└── _layout.tsx           # Layout raíz con AuthProvider

components/
├── ui/                   # Componentes UI base
│   ├── Button.tsx        # Botón reutilizable
│   ├── Input.tsx         # Input con validación
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
└── cards/                # Componentes de tarjetas
    ├── PhotographerCard.tsx
    ├── SessionCard.tsx
    └── MediaGrid.tsx

lib/
├── api.ts               # Cliente API para FastAPI
├── auth.ts              # Utilidades de autenticación
├── types.ts             # Tipos TypeScript globales
└── upload.ts            # Utilidades de subida de archivos

context/
└── AuthContext.tsx      # Context global de autenticación
```

## Requisitos Previos

- Node.js >= 18
- npm o yarn
- Expo CLI (se instala automáticamente)
- Backend FastAPI corriendo en `http://localhost:8000`

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd surfapp-frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:

   Edita el archivo `.env` con la URL de tu backend:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:8000/api
   EXPO_PUBLIC_API_TIMEOUT=30000
   ```

   Para desarrollo móvil, usa la IP de tu máquina:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
   ```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

Esto iniciará Expo DevTools. Opciones disponibles:

- **Web**: Presiona `w` para abrir en el navegador
- **iOS**: Presiona `i` para abrir en simulador iOS (solo macOS)
- **Android**: Presiona `a` para abrir en emulador Android
- **Escanear QR**: Usa la app Expo Go en tu dispositivo móvil

### Build para web

```bash
npm run build:web
```

### TypeCheck

```bash
npm run typecheck
```

## Flujo de Autenticación

1. El usuario llega a la app
2. `AuthContext` verifica si hay una sesión guardada en AsyncStorage
3. Si no hay sesión → redirige a `/(auth)/login`
4. Si hay sesión → redirige a `/(tabs)/home`
5. Al hacer login/registro, el token y usuario se guardan localmente
6. El token se incluye automáticamente en todas las peticiones API

## API Client

El cliente API en `lib/api.ts` maneja todas las peticiones al backend:

### Autenticación
- `login(credentials)` - Iniciar sesión
- `register(userData)` - Registrar nuevo usuario
- `getMe()` - Obtener usuario actual
- `logout()` - Cerrar sesión

### Fotógrafos
- `getPhotographers(filters?)` - Listar fotógrafos
- `getPhotographer(id)` - Obtener detalle de fotógrafo

### Reservas
- `createBooking(bookingData)` - Crear nueva reserva
- `getMyBookings()` - Obtener mis reservas
- `updateBookingStatus(id, status)` - Actualizar estado de reserva

### Sesiones
- `getMySessions()` - Obtener mis sesiones
- `getSession(id)` - Obtener detalle de sesión
- `getSessionMedia(sessionId)` - Obtener media de sesión
- `getSessionLogs(sessionId)` - Obtener bitácora de sesión

### Subida de archivos
- `getPresignedUploadUrl(sessionId, filename, fileType)` - Obtener URL pre-firmada
- `uploadFile(presignedUrl, file)` - Subir archivo

### Almacenamiento
- `getStorageUsage()` - Obtener uso de almacenamiento

## Navegación

La app usa **Expo Router** con navegación basada en archivos:

- Rutas de autenticación están protegidas por `AuthContext`
- Las tabs principales son: Home, Sesiones, Perfil
- Navegación dinámica para fotógrafos y sesiones con `[id].tsx`

## Estilos

- Todos los estilos usan `StyleSheet.create()`
- Paleta de colores basada en iOS Human Interface Guidelines
- Componentes responsive con `Dimensions.get('window')`

## Gestión de Estado

- **AuthContext**: Estado global de autenticación
- **Local State**: Cada pantalla maneja su propio estado
- **AsyncStorage**: Persistencia de token y usuario

## Manejo de Errores

- Errores de API se capturan y muestran en UI
- Componente `ErrorMessage` con opción de reintentar
- Estados de carga con `LoadingSpinner`

## Iconos

Usa **Lucide React Native** para todos los iconos:

```tsx
import { Camera, User, Home } from 'lucide-react-native';

<Camera size={24} color="#007AFF" />
```

## Troubleshooting

### El backend no responde

Verifica que:
1. El backend FastAPI esté corriendo
2. La URL en `.env` sea correcta
3. Si usas un dispositivo físico, usa la IP de tu máquina, no `localhost`

### Errores de TypeScript

```bash
npm run typecheck
```

### Limpiar caché de Expo

```bash
npx expo start -c
```

## Próximas Funcionalidades

- [ ] Autenticación con Google OAuth
- [ ] Chat en tiempo real entre surfer y fotógrafo
- [ ] Sistema de notificaciones push
- [ ] Edición de perfil completa
- [ ] Sistema de reviews y ratings
- [ ] Filtros avanzados de búsqueda
- [ ] Modo offline con sincronización

## Contribución

1. Fork el repositorio
2. Crea una branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar features, crea un issue en el repositorio.
