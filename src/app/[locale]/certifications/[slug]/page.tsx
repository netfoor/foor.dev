import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';
import { getTranslations } from '@/lib/i18n/server';
import type { SupportedLocale } from '@/lib/i18n/types';
import CertificationDetailClient from './CertificationDetailClient';

interface CertificationDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    slug: string;
  }>;
}

// Generar metadata SEO dinámico para cada certificación
export async function generateMetadata({ params }: CertificationDetailPageProps): Promise<Metadata> {
  try {
    const { locale, slug } = await params;
    
    // For now, return a basic metadata structure
    // The client-side component will handle the actual data fetching
    return {
      title: `Certification Details | Foor.dev`,
      description: 'View detailed information about this certification.',
      keywords: 'certification, portfolio, professional development, skills',
      authors: [{ name: "Fortino Romero Mantilla", url: "https://foor.dev" }],
      creator: "Fortino Romero Mantilla",
      publisher: "Foor.dev",
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `Certification Details | Foor.dev`,
        description: 'View detailed information about this certification.',
        url: `https://foor.dev/${locale}/certifications/${slug}`,
        siteName: "Foor.dev",
        images: [
          {
            url: `https://foor.dev/images/profile.jpeg`,
            width: 1200,
            height: 630,
            alt: 'Certification Details',
          },
        ],
        locale: locale,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `Certification Details | Foor.dev`,
        description: 'View detailed information about this certification.',
        images: [`https://foor.dev/images/profile.jpeg`],
        creator: "@foor_rm",
      },
      alternates: {
        canonical: `https://foor.dev/${locale}/certifications/${slug}`,
        languages: {
          'en': `https://foor.dev/en/certifications/${slug}`,
          'es': `https://foor.dev/es/certifications/${slug}`,
          'ja': `https://foor.dev/ja/certifications/${slug}`,
        },
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Certification | Foor.dev',
      description: 'View certification details'
    };
  }
}

// We'll skip static generation for now and let pages be generated dynamically
export async function generateStaticParams() {
  // Return empty array to skip static generation and use dynamic rendering
  return [];
}

export default async function CertificationDetailPage({ params }: CertificationDetailPageProps) {
  const { locale, slug } = await params;
  
  // Simply render the client component, it will handle data fetching
  return (
    <CertificationDetailClient 
      locale={locale} 
      slug={slug}
    />
  );
}
