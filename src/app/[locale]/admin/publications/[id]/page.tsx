import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getValidLocale, isValidLocale } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import EditPublicationClient from './EditPublicationClient';

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
    en: 'Edit Publication - Admin | Foor.dev',
    es: 'Editar Publicación - Admin | Foor.dev', 
    ja: '出版物を編集 - 管理者 | Foor.dev'
  };

  const descriptions: Record<SupportedLocale, string> = {
    en: 'Edit publication details, update images, and manage publication information in the admin dashboard.',
    es: 'Editar detalles de la publicación, actualizar imágenes y gestionar información de la publicación en el panel de administración.',
    ja: '出版物の詳細を編集、画像を更新、管理ダッシュボードで出版物情報を管理します。'
  };
  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
    robots: 'noindex, nofollow', // Admin pages should not be indexed
  };
}

export default async function EditPublicationPage({ params }: PageProps) {
  const { locale, id } = await params;
  
  if (!isValidLocale(locale)) {
    notFound();
  }

  return <EditPublicationClient locale={locale} publicationId={id} />;
}
