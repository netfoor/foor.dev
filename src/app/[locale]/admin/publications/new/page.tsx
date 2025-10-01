import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import CreatePublicationClient from './CreatePublicationClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = getValidLocale(locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Create New Publication - Admin | Foor.dev',
    es: 'Crear Nueva Publicación - Admin | Foor.dev', 
    ja: '新しい出版物を作成 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Create a new media publication in the admin dashboard. Upload images, set details, and manage publication information.',
    es: 'Crear una nueva publicación en el panel de administración. Subir imágenes, establecer detalles y gestionar información de la publicación.',
    ja: '管理ダッシュボードで新しい出版物を作成します。画像をアップロード、詳細を設定、出版物情報を管理します。'
  };
  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function CreatePublicationPage({ params }: PageProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CreatePublicationClient />;
}
