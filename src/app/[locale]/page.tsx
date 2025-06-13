import React from 'react';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import Hero from '@/components/ui/Hero';
import type { SupportedLocale } from '@/lib/i18n/types';

interface HomeProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  // Cargar traducciones
  const tCommon = await getTranslations('common', locale);

  return (
    <main className="min-h-screen">
      {/* Header con controles de idioma y tema */}
      <HeaderControls />

      {/* Componente Hero con "Hola Mundo" */}
      <Hero />
    </main>
  );
}
