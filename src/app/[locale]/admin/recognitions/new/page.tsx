import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import CreateRecognitionClient from './CreateRecognitionClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = getValidLocale(locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Create New Recognition - Admin | Foor.dev',
    es: 'Crear Nuevo Reconocimiento - Admin | Foor.dev', 
    ja: '新しい表彰を作成 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Create a new recognition in the admin dashboard. Upload images, set details, and manage recognition information.',
    es: 'Crear un nuevo reconocimiento en el panel de administración. Subir imágenes, establecer detalles y gestionar información del reconocimiento.',
    ja: '管理ダッシュボードで新しい表彰を作成します。画像をアップロード、詳細を設定、表彰情報を管理します。'
  };
  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function CreateRecognitionPage({ params }: PageProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CreateRecognitionClient />;
}
