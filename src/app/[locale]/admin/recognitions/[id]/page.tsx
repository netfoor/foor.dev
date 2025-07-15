import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import EditRecognitionClient from './EditRecognitionClient';

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
    en: 'Edit Recognition - Admin | Foor.dev',
    es: 'Editar Reconocimiento - Admin | Foor.dev', 
    ja: '表彰を編集 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Edit recognition details, update images, and manage recognition information in the admin dashboard.',
    es: 'Editar detalles del reconocimiento, actualizar imágenes y gestionar información del reconocimiento en el panel de administración.',
    ja: '表彰の詳細を編集、画像を更新、管理ダッシュボードで表彰情報を管理します。'
  };
  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function EditRecognitionPage({ params }: PageProps) {
  const { locale, id } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <EditRecognitionClient locale={locale} recognitionId={id} />;
}
