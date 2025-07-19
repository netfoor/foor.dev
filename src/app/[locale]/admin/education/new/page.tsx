import React from 'react';
import { Metadata } from 'next';
import type { SupportedLocale } from '@/lib/i18n/types';
import AdminEducationFormClient from '../AdminEducationFormClient';

interface AdminEducationNewPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminEducationNewPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: New Education | Foor.dev",
      description: "Add new educational background entry."
    },
    es: {
      title: "Admin: Nueva Educación | Foor.dev", 
      description: "Agregar nueva entrada de formación académica."
    },
    ja: {
      title: "管理: 新しい学歴 | Foor.dev",
      description: "新しい学歴エントリーを追加する。"
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

export default async function AdminEducationNewPage({ params }: AdminEducationNewPageProps) {
  const { locale } = await params;
  
  return <AdminEducationFormClient locale={locale} mode="create" />;
}
