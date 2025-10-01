import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import AdminProjectsClient from './AdminProjectsClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminProjectsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Projects | Foor.dev",
      description: "Manage your portfolio projects, upload images, and organize your work."
    },
    es: {
      title: "Admin: Gestionar Proyectos | Foor.dev", 
      description: "Gestiona tus proyectos de portafolio, sube imágenes y organiza tu trabajo."
    },
    ja: {
      title: "管理: プロジェクト管理 | Foor.dev",
      description: "ポートフォリオプロジェクトを管理し、画像をアップロードし、作業を整理する。"
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

export default async function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <AdminProjectsClient locale={locale} />
    </main>
  );
}
