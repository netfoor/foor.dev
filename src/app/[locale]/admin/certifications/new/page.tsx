import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import CreateCertificationClient from './CreateCertificationClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = getValidLocale(locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Create New Certification - Admin | Foor.dev',
    es: 'Crear Nueva Certificación - Admin | Foor.dev', 
    ja: '新しい認定資格を作成 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Create a new certification in the admin dashboard. Upload certificate images, set details, and manage certification information.',
    es: 'Crear una nueva certificación en el panel de administración. Subir imágenes de certificados, establecer detalles y gestionar información de certificación.',
    ja: '管理ダッシュボードで新しい認定資格を作成します。証明書画像をアップロード、詳細を設定、認定資格情報を管理します。'
  };

  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function CreateCertificationPage({ params }: PageProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CreateCertificationClient />;
}
