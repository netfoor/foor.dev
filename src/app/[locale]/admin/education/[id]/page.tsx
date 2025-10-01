import React from 'react';
import { Metadata } from 'next';
import type { SupportedLocale } from '@/lib/i18n/types';
import AdminEducationFormClient from '../AdminEducationFormClient';

interface AdminEducationEditPageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminEducationEditPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Edit Education | Foor.dev",
      description: "Edit educational background entry."
    },
    es: {
      title: "Admin: Editar Educación | Foor.dev", 
      description: "Editar entrada de formación académica."
    },
    ja: {
      title: "管理: 学歴編集 | Foor.dev",
      description: "学歴エントリーを編集する。"
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

export default async function AdminEducationEditPage({ params }: AdminEducationEditPageProps) {
  const { locale, id } = await params;
  
  return <AdminEducationFormClient locale={locale} mode="edit" educationId={id} />;
}
