'use client';

import React from 'react';

/**
 * Header con controles de idioma
 * Client component para poder usar hooks
 */
export const HeaderControls: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 p-4 z-50">
      <div className="flex gap-3 items-center">
        {/* ThemeSelector temporalmente removido hasta resolver el contexto */}
      </div>
    </header>
  );
};

export default HeaderControls;
