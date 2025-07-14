import React from 'react';
import { Metadata } from 'next';
import AdminSkillsClient from './AdminSkillsClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminSkillsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminSkillsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Skills | Foor.dev",
      description: "Manage your technical and soft skills, set proficiency levels, and organize your expertise."
    },
    es: {
      title: "Admin: Gestionar Habilidades | Foor.dev", 
      description: "Gestiona tus habilidades técnicas y blandas, establece niveles de competencia y organiza tu experiencia."
    },
    ja: {
      title: "管理: スキル管理 | Foor.dev",
      description: "技術的およびソフトスキルを管理し、習熟度レベルを設定し、専門知識を整理する。"
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

export default async function AdminSkillsPage({ params }: AdminSkillsPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <AdminSkillsClient locale={locale} />
    </main>
  );
}
