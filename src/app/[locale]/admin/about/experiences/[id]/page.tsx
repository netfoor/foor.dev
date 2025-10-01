import React from 'react';
import { Metadata } from 'next';
import EditExperienceClient from './EditExperienceClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface EditExperiencePageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditExperiencePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Edit Experience | Foor.dev",
      description: "Edit your professional experience details."
    },
    es: {
      title: "Admin: Editar Experiencia | Foor.dev", 
      description: "Edita los detalles de tu experiencia profesional."
    },
    ja: {
      title: "管理: 経験編集 | Foor.dev",
      description: "プロフェッショナルな経験の詳細を編集する。"
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

export default async function EditExperiencePage({ params }: EditExperiencePageProps) {
  const { locale, id } = await params;

  return (
    <main className="flex-1 p-6">
      <EditExperienceClient locale={locale} experienceId={id} />
    </main>
  );
}
