// Configuración central para el sistema de internacionalización
// Este archivo define todos los idiomas soportados, configuraciones por defecto
// y utilidades para la gestión de locales en toda la aplicación

/**
 * Idiomas soportados en la aplicación
 */
export const SUPPORTED_LOCALES = ['en', 'es', 'ja'] as const;

/**
 * Tipo para idiomas soportados (TypeScript)
 */
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * Idioma por defecto de la aplicación
 */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Configuración de cookies para persistencia de idioma
 */
export const LOCALE_COOKIE = {
  name: 'NEXT_LOCALE',
  maxAge: 60 * 60 * 24 * 365, // 1 año
  httpOnly: false, // Necesario para acceso desde client components
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

/**
 * Namespaces disponibles para traducciones
 * Organiza las traducciones por funcionalidad para mejor mantenimiento
 */
export const TRANSLATION_NAMESPACES = [
  'common',     // Elementos comunes (botones, navegación, errores generales)
  'auth',       // Sistema de autenticación
  'homepage',   // Página principal
  'profile',    // Perfil de usuario
  'admin',      // Panel de administración
  'errors',     // Mensajes de error específicos
  'certifications', // Sección de certificaciones
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

/**
 * Configuración de rutas que deben tener prefijo de idioma
 * Estas rutas serán accesibles como /en/about, /es/acerca-de, etc.
 */
export const LOCALIZED_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/profile',
  '/admin',
];

/**
 * Rutas que NO deben tener prefijo de idioma
 * Estas rutas permanecen sin cambios independientemente del idioma
 */
export const NON_LOCALIZED_ROUTES = [
  '/api',
  '/auth/callback',
  '/login',
  '/access-denied',
  '/_next',
  '/favicon.ico',
  '/images',
];

/**
 * Información detallada de cada idioma soportado
 */
export const LOCALE_INFO: Record<SupportedLocale, {
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: string;
}> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: 'en-US',
  },  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'es-ES',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '��',
    dir: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: 'ja-JP',
  },
};

/**
 * Función para validar si un locale es soportado
 * @param locale - String del locale a validar
 * @returns boolean indicando si el locale es válido
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Función para obtener el locale válido más cercano
 * @param locale - Locale preferido
 * @returns Locale válido (fallback al default si es necesario)
 */
export function getValidLocale(locale: string | undefined): SupportedLocale {
  if (!locale) return DEFAULT_LOCALE;
  
  // Verificar coincidencia exacta
  if (isValidLocale(locale)) {
    return locale;
  }
  
  // Verificar coincidencia por prefijo (ej: 'en-US' -> 'en')
  const localePrefix = locale.split('-')[0];
  if (isValidLocale(localePrefix)) {
    return localePrefix;
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Función para determinar si una ruta debe ser localizada
 * @param pathname - Ruta a verificar
 * @returns boolean indicando si la ruta debe tener prefijo de idioma
 */
export function shouldLocalizeRoute(pathname: string): boolean {
  // Verificar rutas explícitamente no localizadas
  for (const route of NON_LOCALIZED_ROUTES) {
    if (pathname.startsWith(route)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Función para extraer el locale de una URL
 * @param pathname - Pathname de la URL
 * @returns Objeto con locale extraído y pathname sin locale
 */
export function extractLocaleFromPath(pathname: string): {
  locale: SupportedLocale;
  pathnameWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return {
      locale: DEFAULT_LOCALE,
      pathnameWithoutLocale: '/',
    };
  }
  
  const potentialLocale = segments[0];
  
  if (isValidLocale(potentialLocale)) {
    return {
      locale: potentialLocale,
      pathnameWithoutLocale: '/' + segments.slice(1).join('/') || '/',
    };
  }
  
  return {
    locale: DEFAULT_LOCALE,
    pathnameWithoutLocale: pathname,
  };
}

/**
 * Función para construir una URL con locale
 * @param pathname - Pathname sin locale
 * @param locale - Locale a agregar
 * @returns URL completa con locale
 */
export function buildLocalizedPath(pathname: string, locale: SupportedLocale): string {
  // Normalizar pathname
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Si es el locale por defecto y la ruta es la raíz, no agregar prefijo
  if (locale === DEFAULT_LOCALE && normalizedPath === '/') {
    return '/';
  }
  
  // Construir ruta con locale
  if (normalizedPath === '/') {
    return `/${locale}`;
  }
  
  return `/${locale}${normalizedPath}`;
}

/**
 * Configuración para el debugging en desarrollo
 */
export const I18N_DEBUG = {
  enabled: process.env.NODE_ENV === 'development',
  logMissingKeys: false, // Desactivado temporalmente para reducir ruido
  logLocaleDetection: true,
  // Desactivar para evitar spam en consola durante el desarrollo
  logTranslationLoading: false,
};

/**
 * Función para logging de debug
 * @param category - Categoría del log
 * @param message - Mensaje a loggear
 * @param data - Datos adicionales
 */
export function debugLog(
  category: 'locale-detection' | 'translation-loading' | 'missing-keys' | 'general',
  message: string,
  data?: any
): void {
  if (!I18N_DEBUG.enabled) return;
  
  const shouldLog = {
    'locale-detection': I18N_DEBUG.logLocaleDetection,
    'translation-loading': I18N_DEBUG.logTranslationLoading,
    'missing-keys': I18N_DEBUG.logMissingKeys,
    'general': true,
  }[category];
  
  if (shouldLog) {
    console.log(`[i18n:${category}]`, message, data ? data : '');
  }
}
