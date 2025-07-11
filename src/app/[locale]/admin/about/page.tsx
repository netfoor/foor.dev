import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import AdminAboutClient from './AdminAboutClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminAboutPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminAboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage About | Foor.dev",
      description: "Manage your about section content, profile information and experiences."
    },
    es: {
      title: "Admin: Gestionar Acerca de | Foor.dev", 
      description: "Gestiona el contenido de tu sección acerca de, información de perfil y experiencias."
    },
    ja: {
      title: "管理: アバウト管理 | Foor.dev",
      description: "アバウトセクションのコンテンツ、プロフィール情報と経験を管理する。"
    }
  };

  const currentSeo = seoData[locale];

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    robots: {
      index: false, // No indexar páginas de admin
      follow: false,
    },
  };
}

export default async function AdminAboutPage({ params }: AdminAboutPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <AdminAboutClient locale={locale} />
    </main>
  );
}
