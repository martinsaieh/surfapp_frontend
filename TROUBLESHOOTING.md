# Troubleshooting - SurfApp

## ❌ Error: "Failed to fetch" al hacer login

### Causa
Las variables de entorno de Supabase no se están cargando correctamente en Expo.

### Solución

#### Paso 1: Detener el servidor
```bash
# Presiona Ctrl+C en la terminal donde corre Expo
```

#### Paso 2: Limpiar caché
```bash
npx expo start -c
```

#### Paso 3: Verificar en consola del navegador

Abre la consola del navegador (F12) y busca estos mensajes:

**Si ves** `❌ Supabase credentials missing!`:
- Las variables de entorno NO se están cargando
- Continúa al Paso 4

**Si ves** `🔐 Attempting login with: surfer@test.com`:
- Las variables SÍ se están cargando
- El problema es otro (ve a sección "Otros Errores")

#### Paso 4: Hardcodear las credenciales temporalmente

Edita `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// TEMPORAL: Hardcoded para testing
const supabaseUrl = 'https://oypfxtbtxbsutqirheoa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cGZ4dGJ0eGJzdXRxaXJoZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTc5OTcsImV4cCI6MjA4MDMzMzk5N30.k1uonuTVXKTefiH8rTHbrGO4BATYSb5XrixF3VrID-w';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing!');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
```

#### Paso 5: Reiniciar
```bash
npm run dev
# Presiona 'w' para abrir en navegador
```

#### Paso 6: Intentar login nuevamente
```
Email: surfer@test.com
Password: password123
```

---

## 🔍 Ver logs de debugging

Abre la **consola del navegador** (F12 → Console) y verás mensajes como:

```
🔐 Attempting login with: surfer@test.com
📊 Supabase response: {hasData: true, error: undefined}
🔑 Verifying password...
✅ Login successful!
```

Si ves estos mensajes, el login está funcionando.

---

## 📋 Otros Errores Comunes

### Error: "Usuario no encontrado"

**Causa**: El email no existe en la base de datos.

**Solución**: Usa exactamente:
```
Email: surfer@test.com
Password: password123
```

(Sin espacios, todo en minúsculas)

---

### Error: "Contraseña incorrecta"

**Causa**: La contraseña no coincide.

**Solución**: Usa exactamente `password123` (sin espacios)

---

### Error: "Error de base de datos"

**Causa**: Las políticas RLS están bloqueando el acceso.

**Solución**:

Verifica las políticas en Supabase:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Debe mostrar una política llamada `"Public can view users for login"` con `roles = {public}`.

Si no existe, ejecuta:

```sql
DROP POLICY IF EXISTS "Users can view all users" ON users;

CREATE POLICY "Public can view users for login"
  ON users FOR SELECT
  USING (true);
```

---

### Error en consola: "401 Unauthorized"

**Causa**: El anon key de Supabase es inválido.

**Solución**:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a Settings → API
3. Copia la "anon public" key
4. Actualiza en `lib/supabase.ts` (temporalmente hardcoded)

---

### No se ve nada después del login

**Causa**: La navegación falló.

**Solución**:

Abre la consola y busca errores de navegación. Si ves un error, ejecuta:

```bash
# Limpiar caché
npx expo start -c
```

---

## 🧪 Verificar que Supabase funciona

### Test rápido en consola del navegador:

```javascript
// Pegar esto en la consola del navegador
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oypfxtbtxbsutqirheoa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cGZ4dGJ0eGJzdXRxaXJoZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTc5OTcsImV4cCI6MjA4MDMzMzk5N30.k1uonuTVXKTefiH8rTHbrGO4BATYSb5XrixF3VrID-w'
);

supabase
  .from('users')
  .select('*')
  .eq('email', 'surfer@test.com')
  .maybeSingle()
  .then(result => console.log('✅ Test result:', result))
  .catch(error => console.error('❌ Test error:', error));
```

Si ves `✅ Test result: {data: {...}, error: null}` → Supabase funciona ✅

Si ves `❌ Test error` → Hay un problema con Supabase ❌

---

## 📞 Si nada funciona

1. **Verifica la URL de Supabase** en `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://oypfxtbtxbsutqirheoa.supabase.co
   ```

2. **Reinicia completamente**:
   ```bash
   # Matar todos los procesos de Node
   killall node

   # Limpiar todo
   rm -rf node_modules/.cache
   rm -rf .expo

   # Reinstalar
   npm install

   # Iniciar limpio
   npx expo start -c
   ```

3. **Revisa los logs en la terminal** donde corre Expo, no solo en el navegador.

---

## ✅ Checklist de verificación

- [ ] `context/AuthContext.tsx` importa `@/lib/api-supabase`
- [ ] Variables en `.env` están correctas
- [ ] Servidor Expo reiniciado con `-c` (limpiar caché)
- [ ] Navegador en modo incógnito (sin cache)
- [ ] Consola del navegador abierta (F12)
- [ ] Email: `surfer@test.com` (exacto)
- [ ] Password: `password123` (exacto)

---

**Última actualización**: Diciembre 2024
