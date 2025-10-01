import React from 'react';
import { Metadata } from 'next';
import CreateProfileClient from './CreateProfileClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface CreateProfilePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export async function generateMetadata({ params }: CreateProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Create Profile | Foor.dev",
      description: "Create your profile information with personal details and photo."
    },
    es: {
      title: "Admin: Crear Perfil | Foor.dev", 
      description: "Crea tu información de perfil con detalles personales y foto."
    },
    ja: {
      title: "管理: プロフィール作成 | Foor.dev",
      description: "個人詳細と写真を含むプロフィール情報を作成する。"
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

export default async function CreateProfilePage({ params }: CreateProfilePageProps) {
  const { locale } = await params;

  return (
    <main className="flex-1 p-6">
  <CreateProfileClient />
    </main>
  );
}
