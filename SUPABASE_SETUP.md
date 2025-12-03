# Usar SurfApp con Supabase

La aplicación está configurada por defecto para consumir una API FastAPI, pero también incluye un adaptador para usar **Supabase** directamente como backend.

## Cambiar a Supabase

### 1. Reemplazar importación en AuthContext

Edita `context/AuthContext.tsx`:

```typescript
// Cambiar esta línea:
import api from '@/lib/api';

// Por esta:
import api from '@/lib/api-supabase';
```

### 2. Verificar variables de entorno

Tu `.env` ya tiene las credenciales de Supabase:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Iniciar la aplicación

```bash
npm run dev
```

¡Listo! La aplicación ahora usa Supabase en lugar de FastAPI.

## Usuarios de Prueba

Consulta `TEST_USERS.md` para las credenciales de prueba.

**Surfer**:
- Email: `surfer@test.com`
- Password: `password123`

**Fotógrafas**:
- Email: `photo@test.com` / Password: `password123`
- Email: `maria@test.com` / Password: `password123`

## Base de Datos

La base de datos ya está configurada con:
- ✅ Tablas: users, photographers, bookings, sessions, media, logs
- ✅ Row Level Security habilitado
- ✅ Políticas de acceso configuradas
- ✅ Usuarios de prueba
- ✅ Datos de ejemplo (sesiones, fotos, reservas)

## Ventajas de usar Supabase

- ✅ No necesitas un backend separado
- ✅ Base de datos PostgreSQL en la nube
- ✅ Autenticación integrada (para futuro)
- ✅ Row Level Security automático
- ✅ Real-time subscriptions (para futuro)
- ✅ Storage para archivos (para futuro)

## Limitaciones Actuales

- ❌ Upload de archivos no implementado todavía
- ❌ Autenticación usa base de datos directa (sin Supabase Auth)

## Volver a FastAPI

Si quieres volver a usar FastAPI:

1. Revierte el cambio en `context/AuthContext.tsx`
2. Configura `EXPO_PUBLIC_API_URL` en `.env`
3. Asegúrate de que tu backend FastAPI esté corriendo

---

**Recomendación**: Usa Supabase si no tienes un backend FastAPI. Es más rápido para desarrollo y no requiere configuración adicional.
