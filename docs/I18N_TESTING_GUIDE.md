# Testing del Sistema de Internacionalización

## Pasos para Probar la Implementación

### 1. Verificar la Instalación

```bash
# Asegúrate de que todas las dependencias están instaladas
npm install

# Verifica que no hay errores de TypeScript
npm run build
```

### 2. Probar las Rutas Localizadas

1. **Visita la página principal:**
   - `http://localhost:3000` → Debería redirigir automáticamente basado en tu configuración de idioma del navegador
   - `http://localhost:3000/en` → Versión en inglés
   - `http://localhost:3000/es` → Versión en español  
   - `http://localhost:3000/fr` → Versión en francés

2. **Prueba el selector de idioma:**
   - Cambia el idioma usando el dropdown en la esquina superior derecha
   - Verifica que la URL cambia y que las traducciones se actualizan
   - Verifica que la cookie se guarda (mira en DevTools > Application > Cookies)

### 3. Probar Client Components

**Página de Perfil:**
```bash
# Navega a /profile o /es/profile o /fr/profile
# Deberías ver:
- Título en el idioma seleccionado
- Campos del formulario traducidos
- Botones de acción traducidos
- Información del sistema mostrando el locale actual
- Fecha formateada según el idioma
- Números formateados con la moneda correcta
```

### 4. Probar Server Components

**Página Principal:**
```bash
# La página principal (/) demuestra:
- SSR completo con traducciones
- Hero section traducida
- Features section traducida
- Detección automática de idioma desde headers
```

### 5. Probar Middleware

**Funcionalidad del Middleware:**
1. **Detección de idioma:** Cambia la configuración de idioma de tu navegador y visita `/`
2. **Persistencia:** El idioma seleccionado debería persistir entre sesiones
3. **Rutas protegidas:** Las rutas como `/profile` deberían mantener el idioma en las redirecciones de autenticación

### 6. Probar Casos Edge

**Rutas que NO deberían localizarse:**
- `/api/*` → Sin prefijo de idioma
- `/auth/callback` → Sin prefijo de idioma
- `/login` → Sin prefijo de idioma (manejado por AuthGuard)
- `/admin` → Sin prefijo de idioma (manejado por AuthGuard)
- `/_next/*` → Recursos estáticos

### 7. Verificar Traduciones

**Archivo de verificación rápida:**
```javascript
// Ejecutar en consola del navegador para verificar traducciones
console.log('Testing translations...');

// Verifica que las traducciones se cargan correctamente
fetch('/translations/en/common.json')
  .then(r => r.json())
  .then(data => console.log('EN Common:', data));

fetch('/translations/es/common.json')
  .then(r => r.json())
  .then(data => console.log('ES Common:', data));
```

## Problemas Comunes y Soluciones

### Error: "Cannot find module negotiator"
```bash
npm install negotiator @types/negotiator
```

### Error: "Cannot find module lucide-react"
```bash
npm install lucide-react
```

### Error: "useTranslation must be used within an I18nProvider"
- Asegúrate de que el componente está envuelto en `<I18nProvider>`
- Verifica que estás usando el hook en un Client Component (`'use client'`)

### Traducciones no se cargan
- Verifica que los archivos JSON están en la ruta correcta: `src/translations/{locale}/{namespace}.json`
- Verifica que la estructura del JSON es válida
- Mira la consola del navegador para errores de carga

### Middleware loops infinitos
- Verifica que las rutas en `NON_LOCALIZED_ROUTES` están correctamente configuradas
- Asegúrate de que `shouldLocalizeRoute()` retorna `false` para rutas que no necesitan localización

## Verificación de Performance

### Lighthouse Score
```bash
# Construir para producción
npm run build
npm start

# Usar Lighthouse para verificar performance
# La página debería mantener buenos scores de performance con i18n
```

### Bundle Analysis
```bash
# Verificar que las traducciones se cargan dinámicamente
# Solo el idioma actual debería estar en el bundle inicial
```

## Debug Mode

En desarrollo, el sistema incluye logs detallados:

```javascript
// En la consola del navegador verás logs como:
[i18n:locale-detection] Locale detected from cookie { locale: 'es' }
[i18n:translation-loading] Loading namespace on client { locale: 'es', namespace: 'common' }
[i18n:missing-keys] Missing translation key { key: 'some.missing.key', namespace: 'common', locale: 'es' }
```

## Test de Integración Completa

### Escenario de Usuario Real:
1. Usuario visita la página por primera vez → Idioma detectado automáticamente
2. Usuario cambia idioma → Cookie guardada, URL actualizada
3. Usuario navega a perfil → Idioma mantenido
4. Usuario cierra navegador y regresa → Idioma persistido desde cookie
5. Usuario inicia sesión → Redirecciones mantienen el idioma
6. Usuario accede a admin sin permisos → Página de error en el idioma correcto

## Comandos Útiles para Testing

```bash
# Limpiar cache de Next.js
rm -rf .next

# Verificar estructura de traducciones
find src/translations -name "*.json" | head -10

# Verificar que todos los archivos de traducción tienen la misma estructura
# (puedes crear un script personalizado para esto)

# Construir y verificar que no hay errores
npm run build

# Linter para verificar código
npm run lint
```

## Siguientes Pasos

1. **Agregar más idiomas:** Crea nuevas carpetas en `src/translations/`
2. **Herramientas de gestión:** Integra con Crowdin, Lokalise, etc.
3. **Validación automática:** Scripts para verificar completeness de traducciones
4. **Tests automatizados:** Jest/Playwright para testing de i18n
5. **Sitemap multiidioma:** Implementar generación automática
6. **Hreflang tags:** Agregar a metadata de páginas
