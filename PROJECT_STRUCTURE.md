# Estructura del Proyecto SurfApp

## Árbol de Archivos

```
surfapp-frontend/
│
├── app/                                    # Rutas de la aplicación (Expo Router)
│   ├── (auth)/                            # Grupo de autenticación
│   │   ├── _layout.tsx                    # Layout de auth
│   │   ├── login.tsx                      # Pantalla de login
│   │   └── register.tsx                   # Pantalla de registro
│   │
│   ├── (tabs)/                            # Navegación principal con tabs
│   │   ├── _layout.tsx                    # Layout de tabs (Home, Sesiones, Perfil)
│   │   ├── home.tsx                       # Búsqueda de fotógrafos
│   │   ├── profile.tsx                    # Perfil del usuario
│   │   └── sessions/                      # Grupo de sesiones
│   │       ├── _layout.tsx                # Layout de sesiones
│   │       ├── index.tsx                  # Lista de sesiones
│   │       └── [id].tsx                   # Detalle de sesión
│   │
│   ├── photographers/                     # Rutas de fotógrafos
│   │   ├── _layout.tsx                    # Layout de fotógrafos
│   │   └── [id].tsx                       # Detalle de fotógrafo
│   │
│   ├── _layout.tsx                        # Layout raíz (AuthProvider)
│   ├── index.tsx                          # Pantalla inicial (redirect)
│   └── +not-found.tsx                     # Pantalla 404
│
├── components/                            # Componentes reutilizables
│   ├── ui/                                # Componentes UI base
│   │   ├── Button.tsx                     # Botón con variantes
│   │   ├── Input.tsx                      # Input con validación
│   │   ├── LoadingSpinner.tsx             # Spinner de carga
│   │   └── ErrorMessage.tsx               # Mensaje de error
│   │
│   └── cards/                             # Componentes de tarjetas
│       ├── PhotographerCard.tsx           # Tarjeta de fotógrafo
│       ├── SessionCard.tsx                # Tarjeta de sesión
│       └── MediaGrid.tsx                  # Grid de fotos/videos
│
├── context/                               # React Context
│   └── AuthContext.tsx                    # Context de autenticación global
│
├── lib/                                   # Lógica de negocio
│   ├── api.ts                             # Cliente API (FastAPI)
│   ├── auth.ts                            # Utilidades de autenticación
│   ├── types.ts                           # Tipos TypeScript globales
│   └── upload.ts                          # Utilidades de subida de archivos
│
├── hooks/                                 # Custom hooks
│   └── useFrameworkReady.ts               # Hook de inicialización (required)
│
├── types/                                 # Definiciones de tipos
│   └── env.d.ts                           # Tipos de variables de entorno
│
├── docs/                                  # Documentación
│   ├── API_INTEGRATION.md                 # Guía de integración con API
│   └── ARCHITECTURE.md                    # Arquitectura del proyecto
│
├── assets/                                # Recursos estáticos
│   └── images/                            # Imágenes
│
├── .vscode/                               # Configuración de VS Code
│   └── settings.json                      # Settings recomendados
│
├── .env                                   # Variables de entorno
├── .env.example                           # Ejemplo de variables de entorno
├── .prettierrc                            # Configuración de Prettier
├── .gitignore                             # Archivos ignorados por git
├── app.json                               # Configuración de Expo
├── package.json                           # Dependencias del proyecto
├── tsconfig.json                          # Configuración de TypeScript
├── README.md                              # Documentación principal
└── PROJECT_STRUCTURE.md                   # Este archivo
```

## Descripción de Archivos Clave

### Configuración

| Archivo | Descripción |
|---------|-------------|
| `app.json` | Configuración de Expo (nombre, version, íconos, etc) |
| `package.json` | Dependencias y scripts del proyecto |
| `tsconfig.json` | Configuración de TypeScript |
| `.prettierrc` | Configuración de formato de código |
| `.env` | Variables de entorno (API URL, timeouts, etc) |

### Rutas (app/)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `index.tsx` | Pantalla inicial (redirige a home o login) |
| `/(auth)/login` | `(auth)/login.tsx` | Inicio de sesión |
| `/(auth)/register` | `(auth)/register.tsx` | Registro de usuario |
| `/(tabs)/home` | `(tabs)/home.tsx` | Búsqueda de fotógrafos |
| `/(tabs)/sessions` | `(tabs)/sessions/index.tsx` | Lista de sesiones |
| `/(tabs)/sessions/:id` | `(tabs)/sessions/[id].tsx` | Detalle de sesión |
| `/(tabs)/profile` | `(tabs)/profile.tsx` | Perfil del usuario |
| `/photographers/:id` | `photographers/[id].tsx` | Detalle de fotógrafo |

### Componentes (components/)

#### UI Components

| Componente | Props Principales | Uso |
|------------|-------------------|-----|
| `Button` | `title`, `onPress`, `loading`, `variant` | Botones en toda la app |
| `Input` | `label`, `error`, `secureTextEntry` | Campos de formulario |
| `LoadingSpinner` | `message`, `size` | Estados de carga |
| `ErrorMessage` | `message`, `onRetry` | Manejo de errores |

#### Card Components

| Componente | Props Principales | Uso |
|------------|-------------------|-----|
| `PhotographerCard` | `photographer`, `onPress` | Lista de fotógrafos |
| `SessionCard` | `session`, `onPress` | Lista de sesiones |
| `MediaGrid` | `media`, `onMediaPress` | Galería de fotos/videos |

### Lógica (lib/)

| Archivo | Responsabilidad |
|---------|-----------------|
| `api.ts` | Cliente centralizado para API REST |
| `auth.ts` | Persistencia de token y usuario (AsyncStorage) |
| `types.ts` | Definiciones TypeScript de toda la app |
| `upload.ts` | Utilidades para subir archivos con presigned URLs |

### Context (context/)

| Context | Estado Compartido |
|---------|-------------------|
| `AuthContext` | `user`, `isAuthenticated`, `login()`, `logout()` |

## Flujo de Datos

### 1. Inicio de Sesión

```
Usuario → Login Screen → AuthContext.login()
  → api.login() → Backend API
  → Respuesta con token + user
  → authStorage.saveToken() + authStorage.saveUser()
  → AuthContext actualiza estado
  → Router redirige a /(tabs)/home
```

### 2. Búsqueda de Fotógrafos

```
Home Screen → useEffect()
  → api.getPhotographers()
  → Backend API
  → Respuesta con array de fotógrafos
  → setPhotographers() actualiza estado local
  → FlatList renderiza PhotographerCard por cada fotógrafo
```

### 3. Crear Reserva

```
Photographer Detail → Botón "Reservar"
  → api.createBooking(data)
  → Backend API
  → Respuesta con booking creado
  → Alert de éxito
  → Router redirige a /(tabs)/sessions
```

### 4. Ver Sesión

```
Sessions List → SessionCard.onPress()
  → Router navega a /(tabs)/sessions/[id]
  → Session Detail Screen → useEffect()
  → api.getSession(id) + api.getSessionMedia(id)
  → Backend API
  → Respuesta con sesión y media
  → Renderiza detalles + MediaGrid
```

## Estados de la Aplicación

### Global State (AuthContext)

- `user`: Usuario actual (null si no está logueado)
- `isLoading`: Estado de carga durante login/registro
- `isAuthenticated`: Boolean derivado de `user`
- `error`: Mensaje de error si aplica

### Local State (por pantalla)

Cada pantalla maneja su propio estado:
- Datos fetched (photographers, sessions, etc)
- Estados de carga (isLoading, isRefreshing)
- Errores locales
- Filtros y búsquedas

### Persistent State (AsyncStorage)

- Token JWT
- Información del usuario
- Preferencias (futuro)

## Navegación

### Stack Navigator (Root)

```
Root Stack
├── (auth)
│   ├── login
│   └── register
├── (tabs)
│   ├── home
│   ├── sessions
│   │   ├── index
│   │   └── [id]
│   └── profile
└── photographers
    └── [id]
```

### Tab Navigator

```
Tabs
├── Home (Búsqueda)
├── Sessions (Sesiones)
└── Profile (Perfil)
```

## API Endpoints Consumidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registrar usuario |
| GET | `/auth/me` | Obtener usuario actual |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/photographers` | Listar fotógrafos |
| GET | `/photographers/{id}` | Obtener fotógrafo |
| POST | `/bookings` | Crear reserva |
| GET | `/bookings/me` | Mis reservas |
| PATCH | `/bookings/{id}` | Actualizar reserva |
| GET | `/surfers/sessions` | Mis sesiones |
| GET | `/sessions/{id}` | Obtener sesión |
| GET | `/sessions/{id}/media` | Media de sesión |
| GET | `/sessions/{id}/logs` | Bitácora de sesión |
| POST | `/sessions/{id}/media/presign` | Presigned URL |
| GET | `/me/storage-usage` | Uso de almacenamiento |

## Tipos TypeScript Principales

```typescript
// Usuario
interface User {
  id: string;
  email: string;
  name: string;
  role: 'surfer' | 'photographer';
  avatar?: string;
}

// Fotógrafo
interface Photographer {
  id: string;
  name: string;
  rating: number;
  spots: string[];
  price_per_session: number;
  available: boolean;
}

// Sesión
interface Session {
  id: string;
  photographer_name: string;
  spot: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  media_count: number;
}

// Media
interface Media {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
}
```

## Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm run dev

# Build para web
npm run build:web

# Verificar tipos TypeScript
npm run typecheck

# Linter (si está configurado)
npm run lint
```

## Variables de Entorno

```bash
# URL del backend (requerido)
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# Timeout de peticiones en ms (opcional)
EXPO_PUBLIC_API_TIMEOUT=30000
```

## Dependencias Principales

```json
{
  "expo": "^54.0.10",
  "expo-router": "~6.0.8",
  "react-native": "0.81.4",
  "typescript": "~5.9.2",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "lucide-react-native": "^0.544.0"
}
```

## Checklist de Desarrollo

### Al agregar una nueva pantalla:

- [ ] Crear archivo en `app/` con nombre apropiado
- [ ] Exportar componente por defecto
- [ ] Agregar tipos TypeScript para props y estado
- [ ] Implementar estados de carga y error
- [ ] Manejar pull-to-refresh si aplica
- [ ] Agregar navegación si es necesario
- [ ] Actualizar esta documentación

### Al agregar un nuevo endpoint API:

- [ ] Agregar método en `lib/api.ts`
- [ ] Agregar tipos en `lib/types.ts`
- [ ] Manejar errores apropiadamente
- [ ] Documentar en `docs/API_INTEGRATION.md`

### Al agregar un nuevo componente:

- [ ] Crear en `components/ui/` o `components/cards/`
- [ ] Definir interface de Props
- [ ] Implementar con TypeScript
- [ ] Agregar estilos con StyleSheet
- [ ] Documentar props principales

## Testing

### Unit Tests (futuro)

```bash
npm test
```

### E2E Tests (futuro)

```bash
npm run test:e2e
```

## Deployment

### Web

```bash
npm run build:web
# Output en dist/
```

### Mobile (EAS Build)

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Contacto y Soporte

Para dudas sobre la estructura o arquitectura del proyecto, consultar:
- `README.md` - Documentación general
- `docs/ARCHITECTURE.md` - Arquitectura detallada
- `docs/API_INTEGRATION.md` - Integración con API

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
