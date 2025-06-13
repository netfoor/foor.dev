# Guía de Internacionalización (i18n) - Next.js con AWS Amplify

Esta guía proporciona una implementación completa y robusta de internacionalización para aplicaciones Next.js utilizando el App Router, integrada con AWS Amplify para una experiencia de desarrollo óptima.

## 📚 Tabla de Contenidos

1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Arquitectura e Integración](#arquitectura-e-integración)
3. [Configuración Inicial](#configuración-inicial)
4. [Implementación Paso a Paso](#implementación-paso-a-paso)
5. [Uso en Componentes](#uso-en-componentes)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Optimización y SEO](#optimización-y-seo)
8. [Mantenimiento](#mantenimiento)

## 🌍 Visión General del Sistema

### Características Principales

- **Detección automática de idioma** basada en cabeceras HTTP, cookies y configuración del usuario
- **Routing dinámico** con prefijos de idioma (`/en/about`, `/es/acerca-de`)
- **Server-Side Rendering (SSR)** completo con traducciones
- **Client-Side Navigation** seamless con cambio de idioma
- **Provider Pattern** para gestión de estado centralizada
- **Hook personalizado** para facilidad de uso en Client Components
- **Helper functions** optimizadas para Server Components
- **Selector de idioma** interactivo y accesible
- **Persistencia robusta** de preferencias de idioma

### Idiomas Soportados

Por defecto, el sistema soporta:
- 🇺🇸 **Inglés (en)** - Idioma por defecto
- 🇪🇸 **Español (es)**
- 🇫🇷 **Francés (fr)**

*Fácilmente extensible para agregar más idiomas.*

## 🏗️ Arquitectura e Integración

### Componentes del Sistema

```
src/
├── lib/
│   └── i18n/
│       ├── config.ts           # Configuración central
│       ├── server.ts           # Funciones para Server Components
│       ├── client.ts           # Hook para Client Components
│       └── types.ts            # Definiciones TypeScript
├── components/
│   ├── providers/
│   │   └── I18nProvider.tsx    # Provider React para Client Components
│   └── ui/
│       └── LanguageSelector.tsx # Selector de idioma
├── middleware.ts               # Middleware extendido con i18n
└── translations/
    ├── en/
    │   ├── common.json
    │   ├── auth.json
    │   └── homepage.json
    ├── es/
    │   ├── common.json
    │   ├── auth.json
    │   └── homepage.json
    └── fr/
        ├── common.json
        ├── auth.json
        └── homepage.json
```

### Flujo de Detección de Idioma

1. **Middleware intercepta** la request
2. **Verifica cookie** `NEXT_LOCALE` existente
3. **Analiza header** `Accept-Language` si no hay cookie
4. **Aplica idioma por defecto** como fallback
5. **Redirige con prefijo** de idioma si es necesario
6. **Carga traducciones** específicas para SSR

## ⚙️ Configuración Inicial

### 1. Instalación de Dependencias

```bash
npm install negotiator @types/negotiator
```

### 2. Variables de Entorno

Agregar al archivo `.env.local`:

```env
# Configuración de i18n
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,es,fr
```

### 3. Estructura de Traducciones

Crear la estructura base de directorios:

```bash
mkdir -p src/translations/en src/translations/es src/translations/fr
mkdir -p src/lib/i18n
mkdir -p src/components/providers
```

## 🚀 Implementación Paso a Paso

### Paso 1: Configuración Central

**Archivo: `src/lib/i18n/config.ts`**

Configuración central que define los idiomas soportados, rutas, y configuraciones por defecto.

### Paso 2: Tipos TypeScript

**Archivo: `src/lib/i18n/types.ts`**

Definiciones de tipos para asegurar type safety en toda la aplicación.

### Paso 3: Middleware Extendido

**Archivo: `src/middleware.ts`**

Extensión del middleware existente para incluir funcionalidad de i18n sin afectar la autenticación.

### Paso 4: Funciones para Server Components

**Archivo: `src/lib/i18n/server.ts`**

Funciones optimizadas para cargar y usar traducciones en Server Components.

### Paso 5: Hook para Client Components

**Archivo: `src/lib/i18n/client.ts`**

Hook personalizado que simplifica el uso de traducciones en Client Components.

### Paso 6: Provider React

**Archivo: `src/components/providers/I18nProvider.tsx`**

Provider que gestiona el estado de traducciones y facilita el acceso desde cualquier Client Component.

### Paso 7: Selector de Idioma

**Archivo: `src/components/ui/LanguageSelector.tsx`**

Componente interactivo para cambiar idiomas con persistencia automática.

### Paso 8: Traducciones Base

Archivos JSON organizados por namespace para facilitar el mantenimiento.

## 💻 Uso en Componentes

### Server Components

```typescript
import { getTranslations } from '@/lib/i18n/server';

export default async function HomePage() {
  const t = await getTranslations('homepage');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: 'Usuario' })}</p>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/client';

export default function InteractiveComponent() {
  const { t, locale, changeLocale } = useTranslation('common');
  
  return (
    <div>
      <p>{t('current_language')}: {locale}</p>
      <button onClick={() => changeLocale('es')}>
        {t('switch_to_spanish')}
      </button>
    </div>
  );
}
```

### Interpolación de Variables

```typescript
// En las traducciones JSON
{
  "welcome": "Bienvenido, {{name}}!",
  "items_count": "Tienes {{count}} elementos"
}

// En el componente
t('welcome', { name: 'Juan' }) // "Bienvenido, Juan!"
t('items_count', { count: 5 }) // "Tienes 5 elementos"
```

## 🔧 Configuración Avanzada

### Pluralización

```json
{
  "items": {
    "zero": "No tienes elementos",
    "one": "Tienes 1 elemento", 
    "other": "Tienes {{count}} elementos"
  }
}
```

```typescript
t('items', { count: 0 }) // "No tienes elementos"
t('items', { count: 1 }) // "Tienes 1 elemento"
t('items', { count: 5 }) // "Tienes 5 elementos"
```

### Nested Keys

```json
{
  "user": {
    "profile": {
      "title": "Perfil de Usuario",
      "settings": {
        "privacy": "Configuración de Privacidad"
      }
    }
  }
}
```

```typescript
t('user.profile.title') // "Perfil de Usuario"
t('user.profile.settings.privacy') // "Configuración de Privacidad"
```

## 🎯 Mejores Prácticas

### 1. Organización de Traducciones

- **Por funcionalidad**: Agrupa por características (`auth`, `dashboard`, `profile`)
- **Namespace común**: Usa `common` para elementos compartidos
- **Claves descriptivas**: `user.profile.edit_button` mejor que `btn_edit`

### 2. Gestión de Traducciones Faltantes

```typescript
// El sistema automáticamente fallback a la clave si no encuentra traducción
t('missing.key') // Retorna 'missing.key' en desarrollo
```

### 3. Performance

- **Lazy loading**: Solo carga el idioma actual
- **Code splitting**: Traducciones por namespace
- **Caché inteligente**: Reutiliza traducciones cargadas

### 4. Desarrollo

```typescript
// Usar variables de entorno para debugging
const DEBUG_I18N = process.env.NODE_ENV === 'development';

if (DEBUG_I18N) {
  console.log('Missing translation:', key);
}
```

## 🔍 Optimización y SEO

### Configuración de Next.js

**Archivo: `next.config.ts`**

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración existente...
  
  // SEO para i18n
  async generateStaticParams() {
    return [
      { locale: 'en' },
      { locale: 'es' },
      { locale: 'fr' }
    ];
  }
};

export default nextConfig;
```

### Meta Tags Hreflang

```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }: { 
  params: { locale: string } 
}): Promise<Metadata> {
  return {
    alternates: {
      canonical: `https://tudominio.com/${params.locale}`,
      languages: {
        'en': 'https://tudominio.com/en',
        'es': 'https://tudominio.com/es',
        'fr': 'https://tudominio.com/fr',
      }
    }
  };
}
```

### Sitemap Multiidioma

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'es', 'fr'];
  const urls = ['', 'about', 'contact'];
  
  return urls.flatMap(url => 
    locales.map(locale => ({
      url: `https://tudominio.com/${locale}/${url}`,
      lastModified: new Date(),
      alternates: {
        languages: locales.reduce((acc, loc) => {
          acc[loc] = `https://tudominio.com/${loc}/${url}`;
          return acc;
        }, {} as Record<string, string>)
      }
    }))
  );
}
```

## 🛠️ Mantenimiento

### Herramientas Recomendadas

1. **Crowdin** - Gestión colaborativa de traducciones
2. **Lokalise** - Platform profesional de localización  
3. **i18n-ally** - Extensión VSCode para gestión de traducciones
4. **Translation validation** - Scripts para validar completeness

### Scripts de Utilidad

**Archivo: `scripts/i18n-validate.js`**

```javascript
// Script para validar que todas las traducciones están completas
const fs = require('fs');
const path = require('path');

function validateTranslations() {
  const locales = ['en', 'es', 'fr'];
  const namespaces = ['common', 'auth', 'homepage'];
  
  // Lógica de validación...
}
```

### Flujo de Trabajo

1. **Desarrollo**: Agregar claves en inglés primero
2. **Extracción**: Script para extraer claves nuevas
3. **Traducción**: Enviar a traductores o herramienta
4. **Validación**: Verificar completeness antes de deploy
5. **Deploy**: Automated con CI/CD

## 🔒 Consideraciones de Seguridad

### Validación de Idiomas

```typescript
function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
```

### Sanitización de Contenido

```typescript
function sanitizeTranslation(text: string): string {
  // Escapar HTML si las traducciones vienen de fuentes externas
  return text.replace(/[<>&"']/g, (match) => {
    const escapeMap: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match];
  });
}
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Traducciones no cargan**: Verificar paths de archivos JSON
2. **Middleware loops**: Comprobar condiciones de redirección
3. **Hydration errors**: Asegurar consistencia server/client
4. **Performance**: Implementar lazy loading de traducciones

### Debugging

```typescript
// Habilitar logs detallados en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('i18n Debug:', {
    locale,
    namespace,
    key,
    translation
  });
}
```

## 📦 Bundle Size Optimization

### Dynamic Imports

```typescript
async function loadTranslations(locale: string, namespace: string) {
  const translations = await import(`@/translations/${locale}/${namespace}.json`);
  return translations.default;
}
```

### Tree Shaking

```typescript
// Usar named exports para permitir tree shaking
export const translations = {
  common: () => import('@/translations/en/common.json'),
  auth: () => import('@/translations/en/auth.json')
};
```

---

## 🎉 Conclusión

Este sistema de internacionalización proporciona una base sólida y escalable para aplicaciones Next.js multiidioma. La integración con AWS Amplify mantiene la compatibilidad con las funcionalidades existentes mientras añade capacidades de i18n robustas.

### Próximos Pasos

1. Implementar todos los archivos según esta guía
2. Configurar traducciones base en JSON
3. Integrar el LanguageSelector en tu layout
4. Testear la funcionalidad en desarrollo
5. Configurar herramientas de gestión de traducciones
6. Implementar validación automática en CI/CD

¿Necesitas ayuda con algún aspecto específico de la implementación? ¡Consulta los ejemplos de código completos a continuación!
