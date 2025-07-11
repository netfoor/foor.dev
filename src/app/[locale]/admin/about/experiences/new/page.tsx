import React from 'react';
import { Metadata } from 'next';
import CreateExperienceClient from './CreateExperienceClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface CreateExperiencePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export async function generateMetadata({ params }: CreateExperiencePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Create Experience | Foor.dev",
      description: "Add a new professional experience to your work history."
    },
    es: {
      title: "Admin: Crear Experiencia | Foor.dev", 
      description: "Agrega una nueva experiencia profesional a tu historial laboral."
    },
    ja: {
      title: "管理: 経験作成 | Foor.dev",
      description: "職歴に新しいプロフェッショナルな経験を追加する。"
    }
  };

  const currentSeo = seoData[locale];

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CreateExperiencePage({ params }: CreateExperiencePageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <CreateExperienceClient locale={locale} />
    </main>
  );
}
