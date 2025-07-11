import React from 'react';
import { Metadata } from 'next';
import type { SupportedLocale } from '@/lib/i18n/types';
import ExperiencesManagementClient from './ExperiencesManagementClient';

interface AdminExperiencesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export async function generateMetadata({ params }: AdminExperiencesPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Experiences | Foor.dev",
      description: "Manage your professional experiences and work history."
    },
    es: {
      title: "Admin: Gestionar Experiencias | Foor.dev", 
      description: "Gestiona tus experiencias profesionales e historial laboral."
    },
    ja: {
      title: "管理: 経験管理 | Foor.dev",
      description: "プロフェッショナルな経験と職歴を管理する。"
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

export default async function AdminExperiencesPage({ params }: AdminExperiencesPageProps) {
  const { locale } = await params;

  return <ExperiencesManagementClient locale={locale} />;
}
