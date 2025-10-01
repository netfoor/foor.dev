import React, { useState } from 'react';
import { Menu, MenuItem, Flex, Text, View } from '@aws-amplify/ui-react';
import { useTranslation } from '@/lib/i18n/client';

// Define todos los locales soportados
type LocaleType = 'en' | 'ja' | 'es';

const flagSources: Record<LocaleType, string> = {
  en: 'https://img.icons8.com/color/48/usa.png',
  ja: 'https://img.icons8.com/color/48/japan.png', 
  es: 'https://img.icons8.com/color/48/mexico.png',
};

const localeNames: Record<LocaleType, string> = {
  en: 'English',
  ja: '日本語',
  es: 'Español',
};

export interface LanguageSelectorProps {
  className?: string;
  mode?: 'light' | 'dark';
  compact?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  mode = 'light',
  compact = false 
}) => {
  const { locale, changeLocale } = useTranslation('common');
  const [currentLocale, setCurrentLocale] = useState<LocaleType>(locale as LocaleType);

  const handleLocaleChange = (newLocale: LocaleType) => {
    setCurrentLocale(newLocale);
    changeLocale(newLocale);
  };

  // Colores temáticos
  const iconColor = mode === 'dark' ? '#93C5FD' : '#F59E0B';
  const hoverBg = mode === 'dark' ? 'rgba(147, 197, 253, 0.1)' : 'rgba(245, 158, 11, 0.1)';
  return (
    <Menu
      menuAlign="end"
      trigger={
        <View
          as="button"
          className={`language-selector-trigger ${className}`}
          padding="0.5rem"
          backgroundColor="transparent"
          border="none"
          borderRadius="0.375rem"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: compact ? '0' : '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Flex alignItems="center" gap="0.5rem">
            <img
              src={flagSources[currentLocale]}
              alt={`${localeNames[currentLocale]} flag`}
              style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '2px',
                objectFit: 'cover'
              }}
            />
          </Flex>
        </View>
      }
      style={{
        '--amplify-components-menu-background-color': mode === 'dark' ? '#1E293B' : '#FFFFFF',
        '--amplify-components-menu-border-color': mode === 'dark' ? '#374151' : '#E5E7EB',
        '--amplify-components-menu-box-shadow': mode === 'dark' 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      } as React.CSSProperties}
    >      {Object.keys(flagSources).map((localeKey) => (
        <MenuItem
          key={localeKey}
          onClick={() => handleLocaleChange(localeKey as LocaleType)}
          style={{ 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            color: mode === 'dark' ? '#E2E8F0' : '#1F2937',
            borderBottom: mode === 'dark' ? '1px solid #374151' : '1px solid #F3F4F6'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = mode === 'dark' ? 'rgba(147, 197, 253, 0.15)' : 'rgba(245, 158, 11, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Flex alignItems="center" gap="0.75rem">
            <img
              src={flagSources[localeKey as LocaleType]}
              alt={`${localeNames[localeKey as LocaleType]} flag`}
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '3px',
                objectFit: 'cover'
              }}
            />
            <Text 
              fontSize="0.875rem"
              fontWeight={currentLocale === localeKey ? "600" : "400"}
              style={{
                color: mode === 'dark' ? '#E2E8F0' : '#1F2937'
              }}
            >
              {localeNames[localeKey as LocaleType]}
            </Text>
          </Flex>
          {currentLocale === localeKey && (
            <View style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: iconColor,
              marginLeft: '0.5rem'
            }} />
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

// Componente para mostrar la bandera clickeable como indicador visual
export const LanguageIndicator: React.FC<{ 
  className?: string;
  size?: number;
  mode?: 'light' | 'dark';
}> = ({ className = '', size = 20, mode = 'light' }) => {
  const { locale, changeLocale } = useTranslation('common');
  const [currentLocale, setCurrentLocale] = useState<LocaleType>(locale as LocaleType);

  const handleLocaleChange = (newLocale: LocaleType) => {
    setCurrentLocale(newLocale);
    changeLocale(newLocale);
  };

  // Colores temáticos
  const hoverBg = mode === 'dark' ? 'rgba(147, 197, 253, 0.1)' : 'rgba(245, 158, 11, 0.1)';

  return (
    <Menu
      menuAlign="end"
      trigger={        <View
          as="button"
          className={`language-indicator-trigger ${className}`}
          padding="0.5rem"
          backgroundColor="transparent"
          border="none"
          borderRadius="0.375rem"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <img
            src={flagSources[currentLocale]}
            alt={`${localeNames[currentLocale]} flag`}
            style={{ 
              width: `${size}px`, 
              height: `${size}px`, 
              borderRadius: '2px',
              objectFit: 'cover'
            }}
          />
        </View>
      }
      style={{
        '--amplify-components-menu-background-color': mode === 'dark' ? '#1E293B' : '#FFFFFF',
        '--amplify-components-menu-border-color': mode === 'dark' ? '#374151' : '#E5E7EB',
        '--amplify-components-menu-box-shadow': mode === 'dark' 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      } as React.CSSProperties}
    >
      {Object.keys(flagSources).map((localeKey) => (
        <MenuItem
          key={localeKey}
          onClick={() => handleLocaleChange(localeKey as LocaleType)}
          style={{ 
            padding: '0.75rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            color: mode === 'dark' ? '#E2E8F0' : '#1F2937',
            borderBottom: mode === 'dark' ? '1px solid #374151' : '1px solid #F3F4F6'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = mode === 'dark' ? 'rgba(147, 197, 253, 0.15)' : 'rgba(245, 158, 11, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Flex alignItems="center" gap="0.75rem">
            <img
              src={flagSources[localeKey as LocaleType]}
              alt={`${localeNames[localeKey as LocaleType]} flag`}
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '3px',
                objectFit: 'cover'
              }}
            />
            <Text 
              fontSize="0.875rem"
              fontWeight={currentLocale === localeKey ? "600" : "400"}
              style={{
                color: mode === 'dark' ? '#E2E8F0' : '#1F2937'
              }}
            >
              {localeNames[localeKey as LocaleType]}
            </Text>
          </Flex>
          {currentLocale === localeKey && (
            <View style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: mode === 'dark' ? '#93C5FD' : '#F59E0B',
              marginLeft: '0.5rem'
            }} />
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default LanguageSelector;
