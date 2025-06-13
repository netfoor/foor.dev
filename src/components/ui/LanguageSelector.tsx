// Selector de idioma interactivo y accesible
// Permite a los usuarios cambiar el idioma de la aplicación con persistencia automática

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/client';
import type { LanguageSelectorProps, SupportedLocale } from '@/lib/i18n/types';
import { LOCALE_INFO, SUPPORTED_LOCALES } from '@/lib/i18n/config';

/**
 * Componente selector de idioma con dropdown
 */
export function LanguageSelector({
  variant = 'dropdown',
  size = 'md',
  showNativeNames = true,
  showFlags = true,
  className = '',
  onLocaleChange
}: LanguageSelectorProps) {
  
  const { locale, changeLocale, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Hidratación del cliente
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Cerrar dropdown al hacer click fuera (solo después de hidratación)
  useEffect(() => {
    if (!isHydrated) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHydrated]);
  
  // Manejar cambio de idioma
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    changeLocale(newLocale);
    onLocaleChange?.(newLocale);
    setIsOpen(false);
  };
  
  // Manejar teclas de navegación
  const handleKeyDown = (event: React.KeyboardEvent, targetLocale?: SupportedLocale) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (targetLocale) {
        handleLocaleChange(targetLocale);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  // Estilos base
  const baseStyles = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3'
  };
  
  const currentLocaleInfo = LOCALE_INFO[locale];
  
  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {SUPPORTED_LOCALES.map((localeOption) => {
          const localeInfo = LOCALE_INFO[localeOption];
          const isActive = locale === localeOption;
          
          return (
            <button
              key={localeOption}
              onClick={() => handleLocaleChange(localeOption)}
              onKeyDown={(e) => handleKeyDown(e, localeOption)}
              className={`
                ${baseStyles[size]}
                rounded-md border transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label={`${t('change_language_to')} ${localeInfo.name}`}
              title={`${t('change_language_to')} ${localeInfo.name}`}
            >
              {showFlags && (
                <span className="mr-1" aria-hidden="true">
                  {localeInfo.flag}
                </span>
              )}
              {showNativeNames ? localeInfo.nativeName : localeInfo.name}
            </button>
          );
        })}
      </div>
    );
  }
  
  if (variant === 'flags') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {SUPPORTED_LOCALES.map((localeOption) => {
          const localeInfo = LOCALE_INFO[localeOption];
          const isActive = locale === localeOption;
          
          return (
            <button
              key={localeOption}
              onClick={() => handleLocaleChange(localeOption)}
              onKeyDown={(e) => handleKeyDown(e, localeOption)}
              className={`
                ${baseStyles[size]}
                rounded-full transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive 
                  ? 'ring-2 ring-blue-500 scale-110' 
                  : 'hover:scale-105 opacity-70 hover:opacity-100'
                }
              `}
              aria-label={`${t('change_language_to')} ${localeInfo.name}`}
              title={`${t('change_language_to')} ${localeInfo.name}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {localeInfo.flag}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
    // Mostrar placeholder simple durante SSR para evitar hydration mismatch
  if (!isHydrated) {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <div
          className={`
            ${baseStyles[size]}
            bg-white border border-gray-300 rounded-md shadow-sm
            flex items-center gap-2 min-w-[120px]
          `}
        >
          {showFlags && (
            <span aria-hidden="true">🌐</span>
          )}
          <span className="flex-1 text-left">
            Language
          </span>
          <ChevronDownIcon 
            className="w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }
  
  // Dropdown variant (default)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Botón principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e)}
        className={`
          ${baseStyles[size]}
          bg-white border border-gray-300 rounded-md shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 flex items-center gap-2 min-w-[120px]
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('select_language')}
      >
        {showFlags && (
          <span aria-hidden="true">{currentLocaleInfo.flag}</span>
        )}
        <span className="flex-1 text-left">
          {showNativeNames ? currentLocaleInfo.nativeName : currentLocaleInfo.name}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className={`
            absolute right-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50
            divide-y divide-gray-100 focus:outline-none
          `}
          role="listbox"
          aria-label={t('language_options')}
        >
          {SUPPORTED_LOCALES.map((localeOption) => {
            const localeInfo = LOCALE_INFO[localeOption];
            const isSelected = locale === localeOption;
            
            return (
              <button
                key={localeOption}
                onClick={() => handleLocaleChange(localeOption)}
                onKeyDown={(e) => handleKeyDown(e, localeOption)}
                className={`
                  w-full text-left px-3 py-2 text-sm hover:bg-gray-100
                  focus:outline-none focus:bg-gray-100
                  transition-colors duration-150 flex items-center gap-2
                  ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
                role="option"
                aria-selected={isSelected}
                aria-label={`${t('change_language_to')} ${localeInfo.name}`}
              >
                {showFlags && (
                  <span aria-hidden="true">{localeInfo.flag}</span>
                )}
                <span className="flex-1">
                  {showNativeNames ? localeInfo.nativeName : localeInfo.name}
                </span>
                {isSelected && (
                  <CheckIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Selector de idioma compacto para espacios reducidos
 */
export function CompactLanguageSelector({
  className = '',
  onLocaleChange
}: Pick<LanguageSelectorProps, 'className' | 'onLocaleChange'>) {
  
  const { locale, changeLocale } = useTranslation('common');
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as SupportedLocale;
    changeLocale(newLocale);
    onLocaleChange?.(newLocale);
  };
  
  return (
    <select
      value={locale}
      onChange={handleChange}
      className={`
        bg-white border border-gray-300 rounded text-sm px-2 py-1
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${className}
      `}
      aria-label="Select language"
    >
      {SUPPORTED_LOCALES.map((localeOption) => {
        const localeInfo = LOCALE_INFO[localeOption];
        return (
          <option key={localeOption} value={localeOption}>
            {localeInfo.flag} {localeInfo.nativeName}
          </option>
        );
      })}
    </select>
  );
}

/**
 * Componente para mostrar el idioma actual
 */
export function CurrentLanguageDisplay({ 
  showFlag = true, 
  className = '' 
}: { 
  showFlag?: boolean; 
  className?: string; 
}) {
  const { locale } = useTranslation('common');
  const localeInfo = LOCALE_INFO[locale];
  
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {showFlag && (
        <span aria-hidden="true">{localeInfo.flag}</span>
      )}
      <span>{localeInfo.nativeName}</span>
    </span>
  );
}
