'use client';

import React from 'react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

/**
 * Header con controles de idioma
 * Client component para poder usar hooks
 */
export const HeaderControls: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <div className="flex gap-3 items-center">
        <LanguageSelector 
          variant="dropdown" 
          size="sm"
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
        />
        {/* ThemeSelector temporalmente removido hasta resolver el contexto */}
      </div>
    </header>
  );
};

export default HeaderControls;
