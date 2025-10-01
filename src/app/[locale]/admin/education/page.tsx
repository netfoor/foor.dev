import React from 'react';
import { Metadata } from 'next';
import type { SupportedLocale } from '@/lib/i18n/types';
import AdminEducationClient from './AdminEducationClient';

interface AdminEducationPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminEducationPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Education | Foor.dev",
      description: "Manage your academic background, degrees, and educational achievements."
    },
    es: {
      title: "Admin: Gestionar Educación | Foor.dev", 
      description: "Gestiona tu formación académica, títulos y logros educativos."
    },
    ja: {
      title: "管理: 学歴管理 | Foor.dev",
      description: "学歴、学位、教育実績を管理する。"
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

export default async function AdminEducationPage({ params }: AdminEducationPageProps) {
  const { locale } = await params;
  
  return <AdminEducationClient locale={locale} />;
}
