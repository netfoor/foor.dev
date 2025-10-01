import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import AdminRecognitionsClient from './AdminRecognitionsClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminRecognitionsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO for admin recognitions page
export async function generateMetadata({ params }: AdminRecognitionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Recognitions | Foor.dev",
      description: "Manage your recognitions and publications, upload images, and organize your achievements."
    },
    es: {
      title: "Admin: Gestionar Reconocimientos | Foor.dev", 
      description: "Gestiona tus reconocimientos y publicaciones, sube imágenes y organiza tus logros."
    },
    ja: {
      title: "管理: 表彰管理 | Foor.dev",
      description: "あなたの表彰と出版物を管理し、画像をアップロードし、あなたの成果を整理する。"
    }
  };

  const currentSeo = seoData[locale];

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    robots: {
      index: false, // Don't index admin pages
      follow: false,
    },
  };
}

export default async function AdminRecognitionsPage({ params }: AdminRecognitionsPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <AdminRecognitionsClient locale={locale} />
    </main>
  );
}
