'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/client';
import LanguageSelector from './LanguageSelector';

interface HeroProps {
  className?: string;
}

/**
 * Componente Hero simple que muestra "Hola Mundo" 
 * con soporte para internacionalización y temas
 */
export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const { t } = useTranslation('common');

  return (
    <section className={`
      flex min-h-screen flex-col items-center justify-center p-8 
      bg-gradient-to-br from-blue-50 via-white to-purple-50 
      dark:from-blue-950 dark:via-gray-900 dark:to-purple-950
      transition-colors duration-200
      ${className}
    `}>
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          {t('hello_world')}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t('welcome_message')}
        </p>
      </div>
      <LanguageSelector className="mt-4" />
    </section>
  );
};

export default Hero;
