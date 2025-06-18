import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import CreateProjectClient from './CreateProjectClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = getValidLocale(locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Create New Project - Admin | Foor.dev',
    es: 'Crear Nuevo Proyecto - Admin | Foor.dev', 
    ja: '新しいプロジェクトを作成 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Create a new project in the admin dashboard. Upload images, set details, and manage project information.',
    es: 'Crear un nuevo proyecto en el panel de administración. Subir imágenes, establecer detalles y gestionar información del proyecto.',
    ja: '管理ダッシュボードで新しいプロジェクトを作成します。画像をアップロード、詳細を設定、プロジェクト情報を管理します。'
  };
  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function CreateProjectPage({ params }: PageProps) {
  const { locale } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <CreateProjectClient />;
}
