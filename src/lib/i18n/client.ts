// Hook para Client Components - Internacionalización
// Este hook proporciona funcionalidad de traducciones para componentes que se ejecutan en el cliente

'use client';

import { useContext, useCallback, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type {
  SupportedLocale,
  TranslationNamespace,
  TranslationParams,
  TranslationOptions,
  UseTranslationReturn,
  I18nContextValue
} from './types';
import { I18nContext } from '@/components/providers/I18nProvider';
import { 
  LOCALE_COOKIE,
  debugLog,
  SUPPORTED_LOCALES
} from './config';

/**
 * Hook principal para usar traducciones en Client Components
 * @param namespace - Namespace de traducciones a usar
 * @returns Objeto con función de traducción y utilidades
 */
export function useTranslation(namespace: TranslationNamespace): UseTranslationReturn {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
    const { locale, translations, changeLocale, loadNamespace, isLoading } = context;
  const router = useRouter();
  const pathname = usePathname();
  
  // Cargar namespace si no está disponible - usando useEffect para evitar setState durante render
  useEffect(() => {
    if (!translations[namespace]) {
      loadNamespace(namespace);
    }
  }, [translations, namespace, loadNamespace]);
  
  // Obtener traducciones del namespace (sin disparar carga durante render)
  const namespaceTranslations = useMemo(() => {
    return translations[namespace] || {};
  }, [translations, namespace]);
  
  /**
   * Función de traducción
   */
  const t = useCallback((
    key: string,
    paramsOrOptions?: TranslationParams | TranslationOptions
  ): string => {
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
      translation = handlePluralization(namespaceTranslations, key, options.count);
      if (translation) {
        params.count = options.count;
      }
    }
    
    // Buscar traducción normal si no hay pluralización
    if (!translation) {
      translation = getNestedTranslation(namespaceTranslations, key);
    }
    
    // Usar valor por defecto si no se encuentra traducción
    if (!translation) {
      translation = options.defaultValue || key;
      
      if (process.env.NODE_ENV === 'development') {
        debugLog('missing-keys', 'Missing translation key', {
          key,
          namespace,
          locale
        });
      }
    }
    
    // Interpolar parámetros
    if (Object.keys(params).length > 0) {
      translation = interpolateParams(translation, params);
    }
    
    return translation;
  }, [namespaceTranslations, namespace, locale]);
    /**
   * Función para cambiar locale con navegación automática
   */
  const handleChangeLocale = useCallback((newLocale: SupportedLocale) => {
    // Actualizar cookie
    document.cookie = `${LOCALE_COOKIE.name}=${newLocale}; path=/; max-age=${LOCALE_COOKIE.maxAge}; SameSite=${LOCALE_COOKIE.sameSite}`;
    
    // Construir nueva URL para la nueva estructura [locale]
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    
    let pathnameWithoutLocale = pathname;
    if (SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
      // Remover el locale actual de la URL
      pathnameWithoutLocale = '/' + pathSegments.slice(1).join('/');
      if (pathnameWithoutLocale === '/') pathnameWithoutLocale = '';
    }
    
    // Construir nueva ruta con el nuevo locale
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
      debugLog('locale-detection', 'Changing locale', { 
      from: locale, 
      to: newLocale, 
      currentPath: pathname,
      newPath 
    });
    
    // Navegar a la nueva URL - el locale se actualizará automáticamente
    // No necesitamos llamar changeLocale del contexto aquí
    router.push(newPath);
  }, [pathname, router, locale]);
  
  return {
    t,
    locale,
    changeLocale: handleChangeLocale,
    isLoading,
    translations: namespaceTranslations
  };
}

/**
 * Hook para obtener información del locale actual
 */
export function useLocale() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider');
  }
  
  return {
    locale: context.locale,
    changeLocale: context.changeLocale,
    isLoading: context.isLoading
  };
}

/**
 * Hook para formatear fechas según el locale actual
 */
export function useDateFormatter() {
  const { locale } = useLocale();
  
  return useCallback((
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    // Usar el locale para formatear
    const localeCode = getLocaleCode(locale);
    return new Intl.DateTimeFormat(localeCode, options).format(date);
  }, [locale]);
}

/**
 * Hook para formatear números según el locale actual
 */
export function useNumberFormatter() {
  const { locale } = useLocale();
  
  return useCallback((
    number: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    const localeCode = getLocaleCode(locale);
    return new Intl.NumberFormat(localeCode, options).format(number);
  }, [locale]);
}

/**
 * Hook para formatear tiempo relativo
 */
export function useRelativeTimeFormatter() {
  const { locale } = useLocale();
  
  return useCallback((
    value: number,
    unit: Intl.RelativeTimeFormatUnit
  ): string => {
    const localeCode = getLocaleCode(locale);
    const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });
    return rtf.format(value, unit);
  }, [locale]);
}

/**
 * Hook para pre-cargar namespaces
 */
export function usePreloadNamespaces() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('usePreloadNamespaces must be used within an I18nProvider');
  }
  
  return useCallback(async (namespaces: TranslationNamespace[]) => {
    await Promise.all(
      namespaces.map(namespace => context.loadNamespace(namespace))
    );
  }, [context]);
}

// Funciones de utilidad

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
 * Convierte locale interno a código de locale estándar
 */
function getLocaleCode(locale: SupportedLocale): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    ja: 'ja-JP'
  };
  
  return localeMap[locale] || 'en-US';
}

/**
 * Hook para obtener la URL localizada de una ruta
 */
export function useLocalizedPath() {
  const { locale } = useLocale();
    return useCallback((path: string): string => {
    // Construir ruta localizada con nueva estructura [locale]
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
  }, [locale]);
}

/**
 * Hook para detectar cambios de idioma en tiempo real
 */
export function useLocaleChange(callback: (locale: SupportedLocale) => void) {
  const { locale } = useLocale();
  const previousLocale = useMemo(() => locale, []);
  
  useMemo(() => {
    if (previousLocale !== locale) {
      callback(locale);
    }
  }, [locale, previousLocale, callback]);
}

/**
 * Hook para verificar si un namespace está cargado
 */
export function useIsNamespaceLoaded(namespace: TranslationNamespace): boolean {
  const context = useContext(I18nContext);
  
  if (!context) {
    return false;
  }
  
  return !!context.translations[namespace];
}
