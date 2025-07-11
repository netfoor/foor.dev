import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminExperiencesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
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
      description: "職歴と専門経験を管理する。"
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
  
  // Redirect to the about/experiences page
  redirect(`/${locale}/admin/about/experiences`);
}
