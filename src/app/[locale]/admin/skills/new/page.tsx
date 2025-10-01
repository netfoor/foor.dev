import React from 'react';
import { Metadata } from 'next';
import CreateSkillClient from './CreateSkillClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface CreateSkillPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// SEO metadata for creating skills
export async function generateMetadata({ params }: CreateSkillPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Create New Skill | Admin - Foor.dev",
      description: "Create a new technical or soft skill for your portfolio."
    },
    es: {
      title: "Crear Nueva Habilidad | Admin - Foor.dev", 
      description: "Crear una nueva habilidad técnica o blanda para tu portafolio."
    },
    ja: {
      title: "新しいスキルを作成 | Admin - Foor.dev",
      description: "ポートフォリオ用の新しい技術的またはソフトスキルを作成する。"
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

export default async function CreateSkillPage({ params }: CreateSkillPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <CreateSkillClient locale={locale} />
    </main>
  );
}
