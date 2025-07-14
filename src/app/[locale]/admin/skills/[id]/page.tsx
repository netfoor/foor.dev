import React from 'react';
import { Metadata } from 'next';
import EditSkillClient from './EditSkillClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface EditSkillPageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

// SEO metadata for editing skills
export async function generateMetadata({ params }: EditSkillPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Edit Skill | Admin - Foor.dev",
      description: "Edit your technical or soft skill information."
    },
    es: {
      title: "Editar Habilidad | Admin - Foor.dev", 
      description: "Edita la información de tu habilidad técnica o blanda."
    },
    ja: {
      title: "スキルを編集 | Admin - Foor.dev",
      description: "技術的またはソフトスキルの情報を編集する。"
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

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { locale, id } = await params;

  return (
    <main className="flex-1 p-6">
      <EditSkillClient locale={locale} skillId={id} />
    </main>
  );
}
