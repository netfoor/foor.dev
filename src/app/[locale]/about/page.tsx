import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import AboutSection from '@/components/ui/AboutSection';
import Footer from '@/components/ui/Footer';
import type { SupportedLocale } from '@/lib/i18n/types';

interface AboutPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para la página de About
export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "About Fortino Romero - AWS Cloud Engineer & DevOps Advocate | Foor.dev",
      description: "Learn about Fortino Romero's journey as an AWS Cloud Engineer, DevOps advocate, and tech community leader. Discover his mission, vision, and professional philosophy.",
      keywords: "Fortino Romero, AWS Cloud Engineer, DevOps advocate, cloud computing professional, tech community leader, AWS expert, serverless architecture, Mexico tech leader"
    },
    es: {
      title: "Acerca de Fortino Romero - Ingeniero Cloud AWS y Defensor DevOps | Foor.dev", 
      description: "Conoce la trayectoria de Fortino Romero como Ingeniero Cloud AWS, defensor DevOps y líder de comunidades tecnológicas. Descubre su misión, visión y filosofía profesional.",
      keywords: "Fortino Romero, Ingeniero Cloud AWS, defensor DevOps, profesional computación nube, líder comunidades tech, experto AWS, arquitectura serverless, líder tech México"
    },
    ja: {
      title: "Fortino Romeroについて - AWSクラウドエンジニア・DevOpsアドボケート | Foor.dev",
      description: "AWSクラウドエンジニア、DevOpsアドボケート、テクノロジーコミュニティリーダーとしてのFortino Romeroの軌跡をご覧ください。彼のミッション、ビジョン、職業哲学を発見してください。",
      keywords: "Fortino Romero, AWSクラウドエンジニア, DevOpsアドボケート, クラウドコンピューティング専門家, テクノロジーコミュニティリーダー, AWS専門家, サーバーレスアーキテクチャ, メキシコテクノロジーリーダー"
    }
  };

  const currentSeo = seoData[locale];
  const baseUrl = "https://foor.dev";

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    keywords: currentSeo.keywords,
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
      type: 'profile',
      locale: locale,
      url: `${baseUrl}/${locale}/about`,
      title: currentSeo.title,
      description: currentSeo.description,
      siteName: 'Foor.dev',
      images: [
        {
          url: `${baseUrl}/images/profile.jpeg`,
          width: 1200,
          height: 630,
          alt: 'Fortino Romero - AWS Cloud Engineer',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: currentSeo.title,
      description: currentSeo.description,
      images: [`${baseUrl}/images/profile.jpeg`],
      creator: '@fortino_rom',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        'en': `${baseUrl}/en/about`,
        'es': `${baseUrl}/es/about`,
        'ja': `${baseUrl}/ja/about`,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations('homepage');

  return (
    <div className="min-h-screen">
      <HeaderControls />
      <AboutSection locale={locale} />
      <Footer />
    </div>
  );
}
