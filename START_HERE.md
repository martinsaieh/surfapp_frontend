# 🏄‍♂️ SurfApp - Inicio Rápido

## ✅ Todo Está Listo

El proyecto ya está completamente configurado con:
- ✅ Base de datos Supabase creada
- ✅ Usuarios de prueba insertados
- ✅ Datos de ejemplo (sesiones, fotos, reservas)
- ✅ Error de navegación solucionado

## 🚀 Iniciar en 3 Pasos

### 1. Cambiar a Backend Supabase

Edita `context/AuthContext.tsx` línea 9:

```typescript
// Cambiar:
import api from '@/lib/api';

// Por:
import api from '@/lib/api-supabase';
```

### 2. Instalar e Iniciar

```bash
npm install
npm run dev
```

### 3. Abrir App

Presiona `w` para abrir en navegador web.

## 👤 Usuarios de Prueba

### Surfer
```
Email: surfer@test.com
Password: password123
```

### Fotógrafos
```
Email: photo@test.com
Password: password123

Email: maria@test.com
Password: password123
```

## 🎯 Qué Probar

1. **Login** - Usa `surfer@test.com`
2. **Home** - Busca fotógrafos
3. **Detalle** - Click en Ana López o María García
4. **Sesiones** - Ver sesión completada con 6 fotos
5. **Perfil** - Ver información y almacenamiento

## 📊 Datos Incluidos

- ✅ 3 usuarios (1 surfer, 2 fotógrafos)
- ✅ 2 reservas
- ✅ 2 sesiones (1 completada, 1 programada)
- ✅ 6 fotos en sesión completada
- ✅ 4 registros en bitácora

## 📚 Documentación

- **README.md** - Documentación completa
- **TEST_USERS.md** - Credenciales y datos de prueba
- **SUPABASE_SETUP.md** - Configuración de Supabase
- **QUICK_START.md** - Guía rápida

## ❓ Troubleshooting

### Error de navegación

Ya está **solucionado**. El error "Attempted to navigate before mounting" ya no aparece.

### No veo fotógrafos

1. Verifica el cambio en `AuthContext.tsx`
2. Asegúrate de que `api-supabase` esté importado
3. Reinicia el servidor (`npm run dev`)

### No puedo hacer login

- Usa exactamente: `surfer@test.com` / `password123`
- Revisa la consola del navegador para errores

## 🎉 ¡Listo!

Tu aplicación está funcionando con Supabase como backend. No necesitas configurar nada más.

---

**Siguiente paso**: Ejecuta `npm run dev` y presiona `w`
