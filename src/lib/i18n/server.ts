// Funciones para Server Components - Internacionalización
// Estas funciones están optimizadas para Server-Side Rendering y no pueden usarse en Client Components

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import type { 
  SupportedLocale, 
  TranslationNamespace, 
  NamespaceTranslations,
  TranslationParams,
  TranslationOptions,
  LocaleDetectionResult
} from './types';
import { 
  DEFAULT_LOCALE, 
  SUPPORTED_LOCALES, 
  LOCALE_COOKIE,
  getValidLocale,
  isValidLocale,
  debugLog
} from './config';

/**
 * Cache para traducciones cargadas en el servidor
 * Evita cargar múltiples veces el mismo archivo durante el SSR
 */
const translationCache = new Map<string, NamespaceTranslations>();

/**
 * Detecta el locale preferido del usuario desde cookies y headers
 * Función cached para evitar múltiples evaluaciones durante SSR
 */
export const detectLocale = cache(async (): Promise<LocaleDetectionResult> => {
  try {
    // 1. Verificar cookie primero (mayor prioridad)
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE.name);
    
    if (localeCookie?.value && isValidLocale(localeCookie.value)) {
      debugLog('locale-detection', 'Locale detected from cookie', { locale: localeCookie.value });
      return {
        locale: localeCookie.value,
        source: 'cookie',
        confidence: 1.0
      };
    }

    // 2. Analizar header Accept-Language
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    
    if (acceptLanguage) {
      const detectedLocale = parseAcceptLanguage(acceptLanguage);
      if (detectedLocale) {
        debugLog('locale-detection', 'Locale detected from headers', { 
          locale: detectedLocale,
          acceptLanguage 
        });
        return {
          locale: detectedLocale,
          source: 'header',
          confidence: 0.8
        };
      }
    }

    // 3. Fallback al locale por defecto
    debugLog('locale-detection', 'Using default locale', { locale: DEFAULT_LOCALE });
    return {
      locale: DEFAULT_LOCALE,
      source: 'default',
      confidence: 0.5
    };

  } catch (error) {
    console.error('Error detecting locale:', error);
    return {
      locale: DEFAULT_LOCALE,
      source: 'default',
      confidence: 0.0
    };
  }
});

/**
 * Parsea el header Accept-Language y retorna el mejor locale soportado
 */
function parseAcceptLanguage(acceptLanguage: string): SupportedLocale | null {
  // Parse formato: "en-US,en;q=0.9,es;q=0.8,fr;q=0.7"
  const locales = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qString] = lang.trim().split(';');
      const quality = qString ? parseFloat(qString.split('=')[1]) : 1.0;
      return { locale: locale.trim(), quality };
    })
    .sort((a, b) => b.quality - a.quality); // Ordenar por calidad

  // Buscar el primer locale soportado
  for (const { locale } of locales) {
    const validLocale = getValidLocale(locale);
    if (validLocale !== DEFAULT_LOCALE || locale.startsWith(DEFAULT_LOCALE)) {
      return validLocale;
    }
  }

  return null;
}

/**
 * Carga traducciones para un namespace específico
 * Función cached para optimizar el rendimiento en SSR
 */
export const loadTranslations = cache(async (
  locale: SupportedLocale,
  namespace: TranslationNamespace
): Promise<NamespaceTranslations> => {
  const cacheKey = `${locale}-${namespace}`;
  
  // Verificar cache
  if (translationCache.has(cacheKey)) {
    debugLog('translation-loading', 'Loading from cache', { locale, namespace });
    return translationCache.get(cacheKey)!;
  }

  try {
    debugLog('translation-loading', 'Loading from file system', { locale, namespace });
    
    // Cargar archivo de traducción
    const translations = await import(`@/translations/${locale}/${namespace}.json`);
    const translationData = translations.default || translations;
    
    // Guardar en cache
    translationCache.set(cacheKey, translationData);
    
    return translationData;
  } catch (error) {
    console.error(`Error loading translations for ${locale}/${namespace}:`, error);
    
    // Fallback al idioma por defecto si no es el que estamos intentando cargar
    if (locale !== DEFAULT_LOCALE) {
      debugLog('translation-loading', 'Falling back to default locale', { 
        originalLocale: locale, 
        defaultLocale: DEFAULT_LOCALE,
        namespace 
      });
      
      try {
        const fallbackTranslations = await import(`@/translations/${DEFAULT_LOCALE}/${namespace}.json`);
        const fallbackData = fallbackTranslations.default || fallbackTranslations;
        
        // Cache también el fallback para evitar múltiples intentos
        translationCache.set(cacheKey, fallbackData);
        
        return fallbackData;
      } catch (fallbackError) {
        console.error(`Error loading fallback translations for ${DEFAULT_LOCALE}/${namespace}:`, fallbackError);
      }
    }
    
    // Retornar objeto vacío como último recurso
    return {};
  }
});

/**
 * Interpola parámetros en un string de traducción
 */
function interpolateParams(text: string, params: TranslationParams): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Maneja pluralización básica
 */
function handlePluralization(
  translations: any,
  key: string,
  count: number
): string | null {
  const pluralKey = `${key}_plural`;
  
  // Si existe una clave específica para plural
  if (count !== 1 && translations[pluralKey]) {
    return translations[pluralKey];
  }
  
  // Si la traducción es un objeto con reglas de plural
  if (typeof translations[key] === 'object' && translations[key] !== null) {
    const pluralRules = translations[key];
    
    if (count === 0 && pluralRules.zero) return pluralRules.zero;
    if (count === 1 && pluralRules.one) return pluralRules.one;
    if (count === 2 && pluralRules.two) return pluralRules.two;
    if (pluralRules.other) return pluralRules.other;
  }
  
  return null;
}

/**
 * Obtiene una traducción anidada usando dot notation
 */
function getNestedTranslation(obj: any, path: string): string | null {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }
  
  return typeof current === 'string' ? current : null;
}

/**
 * Crea una función de traducción para un namespace específico
 * Esta es la función principal para usar en Server Components
 */
export async function getTranslations(
  namespace: TranslationNamespace,
  locale?: SupportedLocale
): Promise<(key: string, paramsOrOptions?: TranslationParams | TranslationOptions) => string> {
  // Detectar locale si no se proporciona
  const currentLocale = locale || (await detectLocale()).locale;
  
  // Cargar traducciones para el namespace
  const translations = await loadTranslations(currentLocale, namespace);
  
  // Retornar función de traducción
  return function t(
    key: string, 
    paramsOrOptions?: TranslationParams | TranslationOptions
  ): string {
    let params: TranslationParams = {};
    let options: TranslationOptions = {};
    
    // Parsear parámetros
    if (paramsOrOptions) {
      if ('params' in paramsOrOptions || 'defaultValue' in paramsOrOptions || 'count' in paramsOrOptions) {
        options = paramsOrOptions as TranslationOptions;
        params = options.params || {};
      } else {
        params = paramsOrOptions as TranslationParams;
      }
    }
    
    let translation: string | null = null;
    
    // Manejar pluralización si se proporciona count
    if (options.count !== undefined) {
      translation = handlePluralization(translations, key, options.count);
      if (translation) {
        params.count = options.count;
      }
    }
    
    // Buscar traducción normal si no hay pluralización
    if (!translation) {
      translation = getNestedTranslation(translations, key);
    }
    
    // Usar valor por defecto si no se encuentra traducción
    if (!translation) {
      translation = options.defaultValue || key;
      
      if (process.env.NODE_ENV === 'development') {
        debugLog('missing-keys', 'Missing translation key', {
          key,
          namespace,
          locale: currentLocale
        });
      }
    }
    
    // Interpolar parámetros
    if (Object.keys(params).length > 0) {
      translation = interpolateParams(translation, params);
    }
    
    return translation;
  };
}

/**
 * Función helper para obtener el locale actual en Server Components
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  const result = await detectLocale();
  return result.locale;
}

/**
 * Función helper para verificar si un locale está disponible
 */
export function isLocaleAvailable(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Función helper para obtener información del locale actual
 */
export async function getLocaleInfo() {
  const locale = await getCurrentLocale();
  const { LOCALE_INFO } = await import('./config');
  
  return {
    locale,
    ...LOCALE_INFO[locale],
  };
}

/**
 * Función para formatear fechas según el locale
 */
export async function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): Promise<string> {
  const locale = await getCurrentLocale();
  const { LOCALE_INFO } = await import('./config');
  
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].numberFormat, options).format(date);
}

/**
 * Función para formatear números según el locale
 */
export async function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
): Promise<string> {
  const locale = await getCurrentLocale();
  const { LOCALE_INFO } = await import('./config');
  
  return new Intl.NumberFormat(LOCALE_INFO[locale].numberFormat, options).format(number);
}

/**
 * Función para pre-cargar múltiples namespaces (útil para páginas complejas)
 */
export async function preloadTranslations(
  namespaces: TranslationNamespace[],
  locale?: SupportedLocale
): Promise<Record<TranslationNamespace, NamespaceTranslations>> {
  const currentLocale = locale || (await detectLocale()).locale;
  
  const translations = await Promise.all(
    namespaces.map(async (namespace) => {
      const data = await loadTranslations(currentLocale, namespace);
      return [namespace, data] as const;
    })
  );
  
  return Object.fromEntries(translations) as Record<TranslationNamespace, NamespaceTranslations>;
}
