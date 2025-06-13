import React from 'react';
import { getTranslations } from '@/lib/i18n/server';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import HomePageClient from './HomePageClient';
import AmplifyUIShowcase from '@/components/examples/AmplifyUIShowcase';
import type { SupportedLocale } from '@/lib/i18n/types';

interface HomeProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  // Cargar traducciones usando el locale del parámetro
  const [tHomepage, tCommon] = await Promise.all([
    getTranslations('homepage', locale),
    getTranslations('common', locale)
  ]);

  // Preparar datos para el client component
  const pageData = {
    title: tHomepage('title'),
    subtitle: tHomepage('subtitle'), 
    description: tHomepage('description'),
    hero: {
      headline: tHomepage('hero.headline'),
      subheadline: tHomepage('hero.subheadline'),
      ctaPrimary: tHomepage('hero.cta_primary'),
      ctaSecondary: tHomepage('hero.cta_secondary')
    },
    features: {
      title: tHomepage('features.title'),
      subtitle: tHomepage('features.subtitle'),
      items: [
        {
          title: tHomepage('features.feature_1.title'),
          description: tHomepage('features.feature_1.description')
        },
        {
          title: tHomepage('features.feature_2.title'),
          description: tHomepage('features.feature_2.description')
        },
        {
          title: tHomepage('features.feature_3.title'),
          description: tHomepage('features.feature_3.description')
        }
      ]
    },
    navigation: {
      login: tHomepage('navigation.login'),
      signUp: tHomepage('navigation.sign_up')
    }
  };

  return (
    <main className="min-h-screen">      {/* Header con selector de idioma */}
      <header className="fixed top-0 right-0 p-4 z-50">
        <div className="flex gap-3 items-center">
          <LanguageSelector 
            variant="dropdown" 
            size="sm"
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
          />
          {/* ThemeSelector se mueve al HomePageClient para evitar problemas de SSR */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
        <div className="max-w-4xl text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {pageData.hero.headline}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {pageData.hero.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              {pageData.hero.ctaPrimary}
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {pageData.hero.ctaSecondary}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {pageData.features.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {pageData.features.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pageData.features.items.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amplify UI Theme Showcase Section */}
      <section className="py-20 px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Demostración de Theming Personalizado
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explora cómo los componentes de AWS Amplify UI se adaptan automáticamente al tema personalizado
          </p>
        </div>
        
        <AmplifyUIShowcase />
      </section>

      {/* Client Component para funcionalidad interactiva */}
      <HomePageClient />
    </main>
  );
}
