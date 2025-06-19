// Provider de React para el sistema de internacionalización
// Gestiona el estado global de traducciones y facilita el acceso desde Client Components

'use client';

import React, { createContext, useReducer, useCallback, useEffect, useMemo, ReactNode } from 'react';
import type {
  SupportedLocale,
  TranslationNamespace,
  NamespaceTranslations,
  LoadedTranslations,
  I18nContextValue,
  I18nProviderProps
} from '@/lib/i18n/types';
import { DEFAULT_LOCALE, debugLog } from '@/lib/i18n/config';

/**
 * Estados para el reducer de i18n
 */
type I18nState = {
  locale: SupportedLocale;
  translations: LoadedTranslations;
  isLoading: boolean;
  loadingNamespaces: Set<string>;
};

/**
 * Acciones para el reducer de i18n
 */
type I18nAction =
  | { type: 'SET_LOCALE'; payload: SupportedLocale }
  | { type: 'SET_TRANSLATIONS'; payload: { namespace: TranslationNamespace; translations: NamespaceTranslations } }
  | { type: 'START_LOADING'; payload: TranslationNamespace }
  | { type: 'FINISH_LOADING'; payload: TranslationNamespace }
  | { type: 'SET_LOADING'; payload: boolean };

/**
 * Reducer para gestionar el estado de i18n
 */
function i18nReducer(state: I18nState, action: I18nAction): I18nState {
  switch (action.type) {
    case 'SET_LOCALE':
      return {
        ...state,
        locale: action.payload
      };
      
    case 'SET_TRANSLATIONS':
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.namespace]: action.payload.translations
        }
      };
      
    case 'START_LOADING':
      return {
        ...state,
        isLoading: true,
        loadingNamespaces: new Set(state.loadingNamespaces).add(action.payload)
      };
      
    case 'FINISH_LOADING':
      const newLoadingNamespaces = new Set(state.loadingNamespaces);
      newLoadingNamespaces.delete(action.payload);
      return {
        ...state,
        isLoading: newLoadingNamespaces.size > 0,
        loadingNamespaces: newLoadingNamespaces
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    default:
      return state;
  }
}

/**
 * Contexto de i18n
 */
export const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Provider de i18n que gestiona el estado global de traducciones
 */
export function I18nProvider({ 
  children, 
  locale = DEFAULT_LOCALE,
  namespace,
  initialTranslations 
}: I18nProviderProps) {
  
  // Estado inicial
  const [state, dispatch] = useReducer(i18nReducer, {
    locale,
    translations: initialTranslations && namespace 
      ? { [namespace]: initialTranslations }
      : {},
    isLoading: false,
    loadingNamespaces: new Set<string>()
  });
  
  /**
   * Función para cargar un namespace de traducciones
   */
  const loadNamespace = useCallback(async (
    targetNamespace: TranslationNamespace
  ): Promise<NamespaceTranslations> => {
    // Si ya está cargado, retornar inmediatamente
    if (state.translations[targetNamespace]) {
      return state.translations[targetNamespace];
    }
    
    // Si ya está cargándose, esperar
    if (state.loadingNamespaces.has(targetNamespace)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (state.translations[targetNamespace]) {
            resolve(state.translations[targetNamespace]);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }
    
    try {
      dispatch({ type: 'START_LOADING', payload: targetNamespace });
      
      debugLog('translation-loading', 'Loading namespace on client', { 
        locale: state.locale, 
        namespace: targetNamespace 
      });
      
      // Cargar traducciones dinámicamente
      const translations = await import(`@/translations/${state.locale}/${targetNamespace}.json`);
      const translationData = translations.default || translations;
      
      // Actualizar estado
      dispatch({ 
        type: 'SET_TRANSLATIONS', 
        payload: { 
          namespace: targetNamespace, 
          translations: translationData 
        } 
      });
      
      dispatch({ type: 'FINISH_LOADING', payload: targetNamespace });
      
      return translationData;
      
    } catch (error) {
      console.error(`Error loading namespace ${targetNamespace} for locale ${state.locale}:`, error);
      
      // Intentar cargar idioma por defecto como fallback
      if (state.locale !== DEFAULT_LOCALE) {
        try {
          debugLog('translation-loading', 'Loading fallback namespace', { 
            namespace: targetNamespace,
            fallbackLocale: DEFAULT_LOCALE
          });
          
          const fallbackTranslations = await import(`@/translations/${DEFAULT_LOCALE}/${targetNamespace}.json`);
          const fallbackData = fallbackTranslations.default || fallbackTranslations;
          
          dispatch({ 
            type: 'SET_TRANSLATIONS', 
            payload: { 
              namespace: targetNamespace, 
              translations: fallbackData 
            } 
          });
          
          dispatch({ type: 'FINISH_LOADING', payload: targetNamespace });
          
          return fallbackData;
          
        } catch (fallbackError) {
          console.error(`Error loading fallback namespace ${targetNamespace}:`, fallbackError);
        }
      }
      
      dispatch({ type: 'FINISH_LOADING', payload: targetNamespace });
      
      // Retornar objeto vacío como último recurso
      const emptyTranslations = {};
      dispatch({ 
        type: 'SET_TRANSLATIONS', 
        payload: { 
          namespace: targetNamespace, 
          translations: emptyTranslations 
        } 
      });
      
      return emptyTranslations;    }
  }, []); // Eliminamos dependencias problemáticas
  /**
   * Función para cambiar el locale
   */
  const changeLocale = useCallback((newLocale: SupportedLocale) => {
    if (newLocale !== state.locale) {
      debugLog('locale-detection', 'Changing locale in provider', { 
        from: state.locale, 
        to: newLocale 
      });
      
      dispatch({ type: 'SET_LOCALE', payload: newLocale });
    }
  }, []); // Eliminamos dependencia problemática
  
  /**
   * Efecto para cargar namespace inicial si se proporciona
   */
  useEffect(() => {
    if (namespace && !state.translations[namespace] && !initialTranslations) {
      loadNamespace(namespace);
    }
  }, [namespace, state.translations, loadNamespace, initialTranslations]);  /**
   * Efecto para actualizar el locale cuando cambia la prop (solo al inicio)
   */
  useEffect(() => {
    if (locale !== state.locale) {
      debugLog('locale-detection', 'Sync provider locale with prop', { 
        propLocale: locale,
        stateLocale: state.locale
      });
      
      dispatch({ type: 'SET_LOCALE', payload: locale });
    }
  }, [locale]); // Solo depende del locale prop, no del state.locale
    // Valor del contexto - memoizado para estabilidad
  const contextValue: I18nContextValue = useMemo(() => ({
    locale: state.locale,
    translations: state.translations,
    changeLocale,
    loadNamespace,
    isLoading: state.isLoading
  }), [state.locale, state.translations, state.isLoading, changeLocale, loadNamespace]);
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * HOC para envolver componentes con el provider de i18n
 */
export function withI18n<P extends object>(
  Component: React.ComponentType<P>,
  locale?: SupportedLocale,
  namespace?: TranslationNamespace
) {
  const WrappedComponent = (props: P) => (
    <I18nProvider locale={locale || DEFAULT_LOCALE} namespace={namespace}>
      <Component {...props} />
    </I18nProvider>
  );
  
  WrappedComponent.displayName = `withI18n(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook para usar el contexto de i18n directamente
 */
export function useI18nContext() {
  const context = React.useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  
  return context;
}
