# Usuarios de Prueba - SurfApp

## Credenciales de Acceso

### 👤 Surfer (Usuario Surfer)
- **Email**: `surfer@test.com`
- **Password**: `password123`
- **Nombre**: Carlos Martínez
- **Rol**: Surfer

**Características**:
- Tiene 2 reservas creadas
- 1 sesión completada con 6 fotos
- 1 sesión programada para próxima semana

---

### 📸 Fotógrafa #1 (Ana López)
- **Email**: `photo@test.com`
- **Password**: `password123`
- **Nombre**: Ana López
- **Rol**: Photographer

**Características**:
- Rating: 4.8 ⭐ (24 reseñas)
- Precio: 80 EUR/sesión
- Experiencia: 8 años
- Spots: Playa del Norte, Punta Galea, Mundaka, Zarautz
- Portfolio: 4 imágenes
- Equipo: Canon EOS R5, Sony A7 III, DJI Drone, GoPro Hero 11

---

### 📸 Fotógrafa #2 (María García)
- **Email**: `maria@test.com`
- **Password**: `password123`
- **Nombre**: María García
- **Rol**: Photographer

**Características**:
- Rating: 4.5 ⭐ (15 reseñas)
- Precio: 60 EUR/sesión
- Experiencia: 5 años
- Spots: Sopelana, Bakio, Zarautz
- Portfolio: 2 imágenes
- Equipo: Canon EOS 5D Mark IV, GoPro Hero 10

---

## Datos de Ejemplo

### Sesiones Creadas

1. **Sesión Completada** (Carlos + Ana)
   - Spot: Playa del Norte
   - Fecha: Hace 5 días
   - Estado: Completada ✅
   - Condiciones:
     - Olas: 2.5m
     - Viento: 15 km/h NE
     - Marea: Rising
     - Temperatura: 16°C
   - Media: 6 fotos disponibles
   - Logs: 4 entradas en la bitácora

2. **Sesión Programada** (Carlos + Ana)
   - Spot: Mundaka
   - Fecha: En 7 días
   - Estado: Programada 📅
   - Hora: 08:00
   - Duración: 2 horas

### Reservas Creadas

1. **Confirmada** - Mundaka con Ana López
   - Fecha: +7 días
   - Precio: 80 EUR
   - Estado: Confirmada

2. **Pendiente** - Zarautz con María García
   - Fecha: +14 días
   - Precio: 60 EUR
   - Estado: Pendiente

---

## Cómo Probar

### 1. Como Surfer (Carlos)

```bash
Email: surfer@test.com
Password: password123
```

**Flujo de prueba**:
1. Iniciar sesión
2. Ver lista de fotógrafos en Home
3. Buscar por "Mundaka" o "Zarautz"
4. Entrar al perfil de Ana López o María García
5. Ver su portfolio y detalles
6. Ir a tab "Sesiones"
7. Ver la sesión completada con 6 fotos
8. Ver la sesión programada
9. Entrar al detalle de la sesión completada
10. Ver fotos en el grid
11. Ver bitácora con 4 registros
12. Ir a tab "Perfil"
13. Ver información personal
14. Cerrar sesión

### 2. Como Fotógrafo (Ana)

```bash
Email: photo@test.com
Password: password123
```

**Flujo de prueba**:
1. Iniciar sesión
2. Ver su propio perfil como fotógrafa en Home
3. Ver sus sesiones programadas
4. Ver detalles de perfil
5. Explorar otras funcionalidades

---

## Base de Datos

### Tablas Creadas

- ✅ `users` - Usuarios del sistema
- ✅ `photographers` - Perfiles de fotógrafos
- ✅ `bookings` - Reservas
- ✅ `sessions` - Sesiones de surf
- ✅ `media` - Fotos y videos
- ✅ `logs` - Bitácora de actividad

### Políticas RLS

Todas las tablas tienen Row Level Security habilitado con políticas que:
- Usuarios pueden ver sus propios datos
- Surfers y fotógrafos pueden ver sus sesiones compartidas
- Solo fotógrafos pueden subir media
- Lectura pública de perfiles de fotógrafos

---

## Notas Importantes

### ⚠️ Solo para Desarrollo

Estos usuarios son **solo para pruebas**. Las contraseñas son simples y públicas.

**NO usar en producción.**

### 🔐 En Producción

En un entorno de producción deberías:
1. Usar Supabase Auth para autenticación real
2. Implementar bcrypt para hash de passwords
3. Implementar refresh tokens
4. Agregar validación de email
5. Implementar 2FA (opcional)
6. Rate limiting en endpoints de auth

### 📝 Personalización

Puedes agregar más usuarios ejecutando SQL en Supabase:

```sql
INSERT INTO users (email, password_hash, name, role)
VALUES ('nuevo@test.com', 'password123', 'Nuevo Usuario', 'surfer');
```

---

## Troubleshooting

### No puedo hacer login

1. Verifica que el backend esté corriendo
2. Verifica que la URL en `.env` sea correcta
3. Verifica que las tablas existan en Supabase
4. Revisa la consola del navegador para errores

### No veo fotógrafos

1. Verifica que los datos estén en la base de datos:
   ```sql
   SELECT * FROM photographers;
   ```
2. Verifica las políticas RLS
3. Revisa la respuesta del endpoint en Network tab

### No veo sesiones

1. Asegúrate de estar logueado como `surfer@test.com`
2. Verifica que las sesiones existan:
   ```sql
   SELECT * FROM sessions WHERE surfer_id = '550e8400-e29b-41d4-a716-446655440001';
   ```

---

**¡Disfruta probando SurfApp!** 🏄‍♂️📸
