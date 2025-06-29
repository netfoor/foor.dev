import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import AdminCertificationsClient from './AdminCertificationsClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AdminCertificationsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminCertificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Certifications | Foor.dev",
      description: "Manage your professional certifications, upload certificate images, and organize your credentials."
    },
    es: {
      title: "Admin: Gestionar Certificaciones | Foor.dev", 
      description: "Gestiona tus certificaciones profesionales, sube imágenes de certificados y organiza tus credenciales."
    },
    ja: {
      title: "管理: 認定資格管理 | Foor.dev",
      description: "プロフェッショナル認定資格を管理し、証明書画像をアップロードし、資格情報を整理する。"
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

export default async function AdminCertificationsPage({ params }: AdminCertificationsPageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
      <AdminCertificationsClient locale={locale} />
    </main>
  );
}
