# Checklist de Desarrollo y Deployment

## Pre-requisitos ✓

- [x] Node.js >= 18 instalado
- [x] npm instalado
- [x] Backend FastAPI configurado y corriendo
- [ ] Expo CLI configurado
- [ ] Cuenta de Expo (para builds nativos)

## Configuración Inicial ✓

- [x] Dependencias instaladas (`npm install`)
- [x] Variables de entorno configuradas (`.env`)
- [x] TypeScript configurado correctamente
- [x] Git inicializado (si aplica)

## Verificación de Código ✓

- [x] TypeScript sin errores (`npm run typecheck`)
- [ ] Tests pasando (`npm test`) - Por implementar
- [ ] Linter sin errores (`npm run lint`) - Por implementar
- [x] Código formateado (Prettier)

## Testing Local

### Web
- [ ] App carga correctamente en navegador
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Búsqueda de fotógrafos funciona
- [ ] Navegación entre pantallas funciona
- [ ] Estado persiste al recargar

### iOS
- [ ] App carga en simulador
- [ ] Navegación funciona
- [ ] Gestos funcionan correctamente
- [ ] Imágenes cargan

### Android
- [ ] App carga en emulador
- [ ] Back button funciona correctamente
- [ ] Permisos solicitados apropiadamente
- [ ] Teclado no oculta inputs

## Integración con Backend

### Autenticación
- [ ] Login retorna token válido
- [ ] Registro crea usuario correctamente
- [ ] Token se persiste en AsyncStorage
- [ ] Logout limpia sesión

### Fotógrafos
- [ ] Lista de fotógrafos se carga
- [ ] Búsqueda por spot funciona
- [ ] Detalle de fotógrafo muestra info completa
- [ ] Portfolio images cargan

### Reservas
- [ ] Crear reserva funciona
- [ ] Lista de reservas se muestra
- [ ] Actualizar estado funciona
- [ ] Cancelar reserva funciona

### Sesiones
- [ ] Lista de sesiones se carga
- [ ] Filtros por estado funcionan
- [ ] Detalle de sesión muestra info completa
- [ ] Media grid muestra fotos/videos

### Almacenamiento
- [ ] Uso de storage se muestra correctamente
- [ ] Barra de progreso refleja uso real

## Performance

- [ ] Tiempo de carga inicial < 3 segundos
- [ ] Navegación fluida (60 FPS)
- [ ] Imágenes optimizadas
- [ ] No hay memory leaks
- [ ] Lists virtualizadas correctamente

## UX/UI

- [ ] Estados de carga visibles
- [ ] Errores mostrados claramente
- [ ] Feedback táctil apropiado
- [ ] Transiciones suaves
- [ ] Textos legibles en todos los tamaños
- [ ] Contraste adecuado

## Seguridad

- [ ] Tokens nunca expuestos en logs
- [ ] Inputs sanitizados
- [ ] HTTPS en producción
- [ ] AsyncStorage usado apropiadamente
- [ ] Validación de email/password

## Accesibilidad (futuro)

- [ ] Labels de accesibilidad
- [ ] Soporte para screen readers
- [ ] Contraste de colores WCAG AA
- [ ] Tamaños de touch targets apropiados

## Documentación

- [x] README.md completo
- [x] API_INTEGRATION.md
- [x] ARCHITECTURE.md
- [x] PROJECT_STRUCTURE.md
- [x] QUICK_START.md
- [ ] CHANGELOG.md (mantener actualizado)

## Pre-Deployment

### Configuración
- [ ] Variables de entorno de producción
- [ ] API URL apunta a producción
- [ ] app.json configurado correctamente
- [ ] Versión incrementada

### Assets
- [ ] Íconos de app (1024x1024)
- [ ] Splash screen
- [ ] Imágenes optimizadas
- [ ] Fonts cargados correctamente

### Builds
- [ ] Build web funciona (`npm run build:web`)
- [ ] Build iOS funciona (eas build)
- [ ] Build Android funciona (eas build)

## Deployment Web

- [ ] Build generado
- [ ] Subido a hosting (Netlify, Vercel, etc)
- [ ] Domain configurado
- [ ] SSL/HTTPS activo
- [ ] Verificar en múltiples navegadores

## Deployment Mobile (EAS)

### iOS
- [ ] Cuenta de Apple Developer activa
- [ ] Certificados configurados
- [ ] Provisioning profiles
- [ ] Build successful
- [ ] TestFlight configurado
- [ ] Beta testers agregados

### Android
- [ ] Keystore generado y respaldado
- [ ] Build signed
- [ ] Google Play Console configurado
- [ ] Internal testing track
- [ ] Beta testers agregados

## Post-Deployment

### Monitoreo
- [ ] Analytics configurado (opcional)
- [ ] Error tracking (Sentry, etc)
- [ ] Performance monitoring
- [ ] User feedback channels

### Maintenance
- [ ] Backups configurados
- [ ] Update strategy definida
- [ ] Support channels activos
- [ ] Issue tracking system

## Testing en Producción

### Smoke Tests
- [ ] App abre correctamente
- [ ] Login funciona
- [ ] Funcionalidades críticas funcionan
- [ ] No crashes inmediatos

### Monitoring
- [ ] Check error rates
- [ ] Check performance metrics
- [ ] Check user feedback
- [ ] Monitor API calls

## Rollback Plan

En caso de problemas críticos:

1. [ ] Documentar el problema
2. [ ] Revertir a versión anterior
3. [ ] Notificar a usuarios si es necesario
4. [ ] Investigar y corregir
5. [ ] Re-deploy con fix

## Checklist por Versión

### v1.0.0 (Actual)
- [x] Autenticación básica
- [x] Búsqueda de fotógrafos
- [x] Gestión de sesiones
- [x] Perfil de usuario
- [x] Integración con API

### v1.1.0 (Próxima)
- [ ] Google OAuth
- [ ] Edición de perfil
- [ ] Subida de fotos desde app
- [ ] Notificaciones push
- [ ] Mejoras de UX

### v1.2.0 (Futuro)
- [ ] Chat en tiempo real
- [ ] Sistema de reviews
- [ ] Filtros avanzados
- [ ] Modo offline
- [ ] Internacionalización

## Ambiente por Ambiente

### Development
```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

### Staging
```bash
EXPO_PUBLIC_API_URL=https://staging-api.surfapp.com/api
```

### Production
```bash
EXPO_PUBLIC_API_URL=https://api.surfapp.com/api
```

## Scripts de Verificación

```bash
# Verificar todo antes de commit
npm run typecheck && npm test && npm run lint

# Build de prueba
npm run build:web

# Verificar tamaño del bundle
npx expo export --platform web --output-dir dist-test
du -sh dist-test
```

## Notas Importantes

- **Nunca** commitear archivos `.env` con credenciales reales
- **Siempre** incrementar versión en `app.json` antes de release
- **Verificar** que todos los endpoints de API estén actualizados
- **Testear** en dispositivos físicos antes de release
- **Mantener** documentación actualizada con cada cambio importante

## Contactos de Emergencia

- **Backend Team**: [contacto]
- **DevOps**: [contacto]
- **Product Owner**: [contacto]

---

**Última actualización**: Diciembre 2024
**Estado**: En desarrollo
