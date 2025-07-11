import React from 'react';
import { Metadata } from 'next';
import EditProfileClient from './EditProfileClient';
import type { SupportedLocale } from '@/lib/i18n/types';

interface EditProfilePageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "Admin: Edit Profile | Foor.dev",
      description: "Edit your profile information and personal details."
    },
    es: {
      title: "Admin: Editar Perfil | Foor.dev", 
      description: "Edita tu información de perfil y detalles personales."
    },
    ja: {
      title: "管理: プロフィール編集 | Foor.dev",
      description: "プロフィール情報と個人詳細を編集する。"
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

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { locale, id } = await params;

  return (
    <main className="flex-1 p-6">
      <EditProfileClient locale={locale} profileId={id} />
    </main>
  );
}
