import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import EditProjectClient from './EditProjectClient';

interface PageProps {
  params: { 
    locale: string;
    id: string;
  };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const locale = getValidLocale(params.locale);
  
  const titles: Record<SupportedLocale, string> = {
    en: 'Edit Project - Admin | Foor.dev',
    es: 'Editar Proyecto - Admin | Foor.dev', 
    ja: 'プロジェクトを編集 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Edit project details, update images, and manage project information in the admin dashboard.',
    es: 'Editar detalles del proyecto, actualizar imágenes y gestionar información del proyecto en el panel de administración.',
    ja: 'プロジェクトの詳細を編集、画像を更新、管理ダッシュボードでプロジェクト情報を管理します。'
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default function EditProjectPage({ params }: PageProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return <EditProjectClient locale={params.locale} projectId={params.id} />;
}
