# Changelog

## [1.0.0] - 2024-12-03

### Añadido
- Frontend completo con React Native + Expo SDK 54
- Autenticación con login/registro
- Búsqueda de fotógrafos con filtros
- Detalle de fotógrafo con portfolio
- Gestión de reservas (crear, listar)
- Lista de sesiones con filtros por estado
- Detalle de sesión con media grid y bitácora
- Perfil de usuario con uso de almacenamiento
- Cliente API para FastAPI backend
- Adaptador para usar Supabase como backend alternativo
- Componentes UI reutilizables (Button, Input, Loading, Error)
- Context global de autenticación con persistencia
- Base de datos Supabase completa con RLS
- Usuarios de prueba pre-creados
- Datos de ejemplo (sesiones, fotos, reservas)
- Documentación completa (8 archivos MD)

### Corregido
- Error de navegación "Attempted to navigate before mounting"
- Error de TypeScript en comparación de segments
- Navegación automática mejorada con setTimeout

### Técnico
- 42 archivos totales
- 3,135+ líneas de código
- 100% tipado TypeScript
- 0 errores de tipo
- Arquitectura modular y escalable

## Próximas Versiones

### [1.1.0] - Planeada
- Autenticación con Google OAuth
- Subida de fotos/videos desde la app
- Notificaciones push
- Chat en tiempo real
- Sistema de reviews y ratings

### [1.2.0] - Planeada
- Modo offline con sincronización
- Internacionalización (i18n)
- Tema oscuro
- Filtros avanzados de búsqueda
- Analytics integrado
