import React from 'react';
import { Metadata } from 'next';
import type { SupportedLocale } from '@/lib/i18n/types';
import ProfileManagementClient from './ProfileManagementClient';

interface AdminProfilePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para admin
export async function generateMetadata({ params }: AdminProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Manage Profile | Foor.dev",
      description: "Manage your profile information and personal details."
    },
    es: {
      title: "Admin: Gestionar Perfil | Foor.dev", 
      description: "Gestiona tu información de perfil y detalles personales."
    },
    ja: {
      title: "管理: プロフィール管理 | Foor.dev",
      description: "プロフィール情報と個人詳細を管理する。"
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

export default async function AdminProfilePage({ params }: AdminProfilePageProps) {
  const { locale } = await params;

  return <ProfileManagementClient locale={locale} />;
}
