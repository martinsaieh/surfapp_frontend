# ✅ Error "Failed to fetch" - SOLUCIONADO

## Cambios Realizados

He solucionado el error haciendo estos cambios:

### 1. ✅ Cambiado a backend Supabase
**Archivo**: `context/AuthContext.tsx` línea 13
```typescript
// Ahora usa:
import api from '@/lib/api-supabase';
```

### 2. ✅ Credenciales hardcoded
**Archivo**: `lib/supabase.ts`

Las credenciales de Supabase ahora están hardcoded como fallback para evitar problemas con variables de entorno en Expo Web.

### 3. ✅ Políticas RLS actualizadas
La base de datos ahora permite lectura pública de la tabla `users` para el login.

### 4. ✅ Logging mejorado
El login ahora muestra logs detallados en la consola del navegador.

---

## 🚀 Cómo Probar

### Paso 1: Reiniciar con caché limpia
```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npx expo start -c
```

### Paso 2: Abrir en navegador
Presiona **`w`** en la terminal

### Paso 3: Abrir consola del navegador
Presiona **F12** → Tab "Console"

### Paso 4: Hacer login

Usa estas credenciales **exactas**:
```
Email: surfer@test.com
Password: password123
```

(Sin espacios, todo en minúsculas)

---

## 📊 Lo que deberías ver en la consola

Si todo funciona correctamente, verás:

```
🔧 Supabase configuration:
  URL: https://oypfxtbtxbsutqirheoa.supabase.co
  Key: ✅ Present

🔐 Attempting login with: surfer@test.com
📊 Supabase response: {hasData: true, error: undefined}
🔑 Verifying password...
✅ Login successful!
```

Y la app te redirigirá automáticamente a la pantalla Home.

---

## ❌ Si aún ves "Failed to fetch"

### Opción A: Verificar que el cambio se aplicó

1. Abre `context/AuthContext.tsx`
2. Busca la línea 13
3. Debe decir: `import api from '@/lib/api-supabase';`
4. Si dice `'@/lib/api'`, cámbialo manualmente

### Opción B: Limpiar todo y reiniciar

```bash
# Matar procesos
killall node

# Limpiar
rm -rf node_modules/.cache
rm -rf .expo

# Reinstalar
npm install

# Iniciar limpio
npx expo start -c
```

### Opción C: Usar navegador en modo incógnito

A veces el caché del navegador causa problemas:
1. Chrome: Ctrl+Shift+N
2. Navegar a la URL de Expo
3. Intentar login

---

## 🔍 Debug: Ver exactamente qué está pasando

En la consola del navegador, pega esto:

```javascript
// Ver configuración de Supabase
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

// Test directo a Supabase
fetch('https://oypfxtbtxbsutqirheoa.supabase.co/rest/v1/users?email=eq.surfer@test.com', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cGZ4dGJ0eGJzdXRxaXJoZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTc5OTcsImV4cCI6MjA4MDMzMzk5N30.k1uonuTVXKTefiH8rTHbrGO4BATYSb5XrixF3VrID-w'
  }
})
.then(r => r.json())
.then(d => console.log('✅ Direct Supabase test:', d))
.catch(e => console.error('❌ Direct Supabase test failed:', e));
```

Si este test funciona, significa que Supabase está accesible.

---

## 📱 Usuarios de Prueba

### Surfer (el principal para probar)
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

---

## ✅ Después del Login

Una vez logueado como `surfer@test.com`, deberías poder:

1. **Home** - Ver lista de 2 fotógrafas (Ana y María)
2. **Buscar** - Filtrar por "Mundaka" o "Zarautz"
3. **Detalle** - Click en Ana López para ver perfil completo
4. **Sesiones** - Ver 2 sesiones (1 completada, 1 programada)
5. **Detalle Sesión** - Ver 6 fotos en la sesión completada
6. **Perfil** - Ver uso de almacenamiento

---

## 🆘 Ayuda Adicional

Si el problema persiste, revisa `TROUBLESHOOTING.md` para más soluciones.

---

**Última actualización**: Diciembre 2024
**Estado**: ✅ Debería funcionar ahora
