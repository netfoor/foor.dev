import React, { useState } from 'react';
import { Menu, MenuItem, Flex, Text, View } from '@aws-amplify/ui-react'; // Importa Flex, Text y View
import { useTranslation } from '@/lib/i18n/client';

// Define todos los locales que aparecen en la imagen
type LocaleType = 'en' | 'ja' | 'es';

const flagSources: Record<LocaleType, string> = {
  en: 'https://img.icons8.com/color/48/usa.png', // Bandera de EE. UU. para English
  ja: 'https://img.icons8.com/color/48/japan.png', // Bandera de Japón para Japonés
  es: 'https://img.icons8.com/color/48/mexico.png', // Bandera de España para Español
};

const localeNames: Record<LocaleType, string> = {
  en: 'English',
  ja: '日本語',
  es: 'Español',
};

export interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { locale, changeLocale } = useTranslation('common');
  const [currentLocale, setCurrentLocale] = useState<LocaleType>(locale as LocaleType); // Asegurarse de que el tipo es LocaleType

  const handleLocaleChange = (newLocale: LocaleType) => {
    setCurrentLocale(newLocale);
    changeLocale(newLocale); // Cambiar el idioma utilizando i18n
  };

  return (
    <Menu
      menuAlign="center"
      trigger={
        <button className={`menu-trigger ${className}`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
          <img
            src={flagSources[currentLocale]}
            alt={`${localeNames[currentLocale]} flag`}
            style={{ width: '24px', height: '24px' }} // Ajusta el tamaño de la bandera del trigger
          />
        </button>
      }
      // Puedes añadir estilos al menú si es necesario para el posicionamiento o sombras
      // menuStyle={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}
    >
      {Object.keys(flagSources).map((localeKey) => (
        <MenuItem
          key={localeKey}
          onClick={() => handleLocaleChange(localeKey as LocaleType)}
          // Añade estilos para el padding y la alineación de los items
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Flex alignItems="center">
            <img
              src={flagSources[localeKey as LocaleType]}
              alt={`${localeNames[localeKey as LocaleType]} flag`}
              style={{ width: '24px', height: '24px', marginRight: '10px' }} // Ajusta el tamaño y margen de las banderas dentro del menú
            />
            <Text>{localeNames[localeKey as LocaleType]}</Text>
          </Flex>
          {currentLocale === localeKey && (
            <View style={{ marginLeft: 'auto' }}> {/* Mover el check a la derecha */}
              →
            </View>
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default LanguageSelector;
