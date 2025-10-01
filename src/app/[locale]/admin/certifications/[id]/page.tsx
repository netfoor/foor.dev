import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import EditCertificationClient from './EditCertificationClient';

interface PageProps {
  params: Promise<{ 
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = getValidLocale(locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Edit Certification - Admin | Foor.dev',
    es: 'Editar Certificación - Admin | Foor.dev', 
    ja: '認定資格を編集 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Edit certification details, update certificate images, and manage certification information in the admin dashboard.',
    es: 'Editar detalles de la certificación, actualizar imágenes de certificados y gestionar información de certificación en el panel de administración.',
    ja: '認定資格の詳細を編集、証明書画像を更新、管理ダッシュボードで認定資格情報を管理します。'
  };

  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function EditCertificationPage({ params }: PageProps) {
  const { locale, id } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <EditCertificationClient locale={locale} certificationId={id} />;
}
