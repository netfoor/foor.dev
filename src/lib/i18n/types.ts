// Definiciones de tipos TypeScript para el sistema de internacionalización
// Proporciona type safety y autocompletado para traducciones

import { SUPPORTED_LOCALES, TRANSLATION_NAMESPACES } from './config';

/**
 * Tipo para idiomas soportados
 */
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * Tipo para namespaces de traducciones
 */
export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

/**
 * Tipo base para objetos de traducción
 * Permite estructuras anidadas con strings como valores finales
 */
export type TranslationObject = {
  [key: string]: string | TranslationObject;
};

/**
 * Tipo para un conjunto completo de traducciones de un namespace
 */
export type NamespaceTranslations = Record<string, any>;

/**
 * Tipo para todas las traducciones cargadas
 */
export type LoadedTranslations = Partial<Record<TranslationNamespace, NamespaceTranslations>>;

/**
 * Parámetros para interpolación en traducciones
 * Permite variables dinámicas en los strings de traducción
 */
export type TranslationParams = Record<string, string | number>;

/**
 * Configuración para pluralización
 */
export type PluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type PluralizedTranslation = Partial<Record<PluralRule, string>>;

/**
 * Opciones para la función de traducción
 */
export interface TranslationOptions {
  /** Parámetros para interpolación */
  params?: TranslationParams;
  
  /** Valor por defecto si no se encuentra la traducción */
  defaultValue?: string;
  
  /** Contador para pluralización */
  count?: number;
  
  /** Locale específico (sobrescribe el actual) */
  locale?: SupportedLocale;
}

/**
 * Función de traducción genérica
 */
export type TranslationFunction = (
  key: string,
  paramsOrOptions?: TranslationParams | TranslationOptions
) => string;

/**
 * Hook de traducción para Client Components
 */
export interface UseTranslationReturn {
  /** Función de traducción */
  t: TranslationFunction;
  
  /** Locale actual */
  locale: SupportedLocale;
  
  /** Función para cambiar locale */
  changeLocale: (newLocale: SupportedLocale) => void;
  
  /** Estado de carga */
  isLoading: boolean;
  
  /** Traducciones cargadas */
  translations: NamespaceTranslations;
}

/**
 * Props para el Provider de i18n
 */
export interface I18nProviderProps {
  children: React.ReactNode;
  locale: SupportedLocale;
  namespace?: TranslationNamespace;
  initialTranslations?: NamespaceTranslations;
}

/**
 * Contexto de i18n
 */
export interface I18nContextValue {
  locale: SupportedLocale;
  translations: LoadedTranslations;
  changeLocale: (newLocale: SupportedLocale) => void;
  loadNamespace: (namespace: TranslationNamespace) => Promise<NamespaceTranslations>;
  isLoading: boolean;
}

/**
 * Props para el selector de idioma
 */
export interface LanguageSelectorProps {
  /** Estilo del selector */
  variant?: 'dropdown' | 'buttons' | 'flags';
  
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  
  /** Mostrar nombres nativos de idiomas */
  showNativeNames?: boolean;
  
  /** Mostrar banderas */
  showFlags?: boolean;
  
  /** Clase CSS personalizada */
  className?: string;
  
  /** Callback cuando cambia el idioma */
  onLocaleChange?: (locale: SupportedLocale) => void;
}

/**
 * Resultado de detección de locale
 */
export interface LocaleDetectionResult {
  /** Locale detectado */
  locale: SupportedLocale;
  
  /** Fuente de la detección */
  source: 'cookie' | 'header' | 'default';
  
  /** Confianza en la detección (0-1) */
  confidence: number;
}

/**
 * Configuración para middleware de i18n
 */
export interface I18nMiddlewareConfig {
  /** Rutas que deben ser localizadas */
  localizedRoutes: string[];
  
  /** Rutas que NO deben ser localizadas */
  nonLocalizedRoutes: string[];
  
  /** Redirigir automáticamente rutas sin locale */
  redirectMissingLocale: boolean;
  
  /** Usar locale por defecto en la URL raíz */
  useDefaultLocaleInUrl: boolean;
}

/**
 * Resultado del middleware de i18n
 */
export interface I18nMiddlewareResult {
  /** Si se debe hacer redirect */
  shouldRedirect: boolean;
  
  /** URL de destino si hay redirect */
  redirectUrl?: string;
  
  /** Locale detectado */
  locale: SupportedLocale;
  
  /** Pathname sin locale */
  pathname: string;
}

/**
 * Configuración de formato de fecha/número por locale
 */
export interface LocaleFormatConfig {
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  currency: string;
}

/**
 * Utilidades de formato por locale
 */
export interface LocaleFormatters {
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
}

/**
 * Error personalizado para el sistema de i18n
 */
export class I18nError extends Error {
  constructor(
    message: string,
    public code: 'MISSING_TRANSLATION' | 'INVALID_LOCALE' | 'NAMESPACE_LOAD_ERROR',
    public locale?: SupportedLocale,
    public namespace?: TranslationNamespace,
    public key?: string
  ) {
    super(message);
    this.name = 'I18nError';
  }
}

/**
 * Opciones para carga de traducciones
 */
export interface TranslationLoadOptions {
  /** Caché las traducciones cargadas */
  cache?: boolean;
  
  /** Timeout para la carga */
  timeout?: number;
  
  /** Reintentar en caso de error */
  retry?: boolean;
  
  /** Número máximo de reintentos */
  maxRetries?: number;
}

/**
 * Metadata de una traducción
 */
export interface TranslationMetadata {
  /** Namespace al que pertenece */
  namespace: TranslationNamespace;
  
  /** Locale */
  locale: SupportedLocale;
  
  /** Fecha de última modificación */
  lastModified?: Date;
  
  /** Versión de la traducción */
  version?: string;
  
  /** Información del traductor */
  translator?: string;
}

/**
 * Estadísticas de traducciones
 */
export interface TranslationStats {
  /** Total de claves */
  totalKeys: number;
  
  /** Claves traducidas */
  translatedKeys: number;
  
  /** Porcentaje de completitud */
  completeness: number;
  
  /** Claves faltantes */
  missingKeys: string[];
}

/**
 * Configuración de validación de traducciones
 */
export interface TranslationValidationConfig {
  /** Verificar claves faltantes */
  checkMissingKeys: boolean;
  
  /** Verificar interpolación */
  checkInterpolation: boolean;
  
  /** Verificar HTML */
  checkHtml: boolean;
  
  /** Longitud máxima de traducción */
  maxLength?: number;
}
