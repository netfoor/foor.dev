import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import RecognitionsPublicationsSection from '@/components/ui/RecognitionsPublicationsSection';
import Footer from '@/components/ui/Footer';
import type { SupportedLocale } from '@/lib/i18n/types';

interface RecognitionsProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado por idioma
export async function generateMetadata({ params }: RecognitionsProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('homepage', locale);
  
  // SEO data for different languages
  const seoData = {
    en: {
      title: "Recognitions & Media Publications | Foor.dev",
      description: "Discover my awards, honors, and media features across various platforms including articles, videos, and social media.",
      keywords: "professional recognitions, awards, media publications, tech articles, cloud computing presentations, AWS community, social media presence"
    },
    es: {
      title: "Reconocimientos y Publicaciones en Medios | Foor.dev",
      description: "Descubre mis premios, reconocimientos y apariciones en medios a través de diversas plataformas incluyendo artículos, videos y redes sociales.",
      keywords: "reconocimientos profesionales, premios, publicaciones en medios, artículos tecnológicos, presentaciones de computación en la nube, comunidad AWS, presencia en redes sociales"
    },
    ja: {
      title: "表彰とメディア出版物 | Foor.dev",
      description: "記事、動画、ソーシャルメディアなど、さまざまなプラットフォームでの私の受賞歴、栄誉、メディア掲載を発見してください。",
      keywords: "専門的な表彰, 賞, メディア出版物, 技術記事, クラウドコンピューティングプレゼンテーション, AWSコミュニティ, ソーシャルメディアのプレゼンス"
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
      title: currentSeo.title,
      description: currentSeo.description,
      url: `${baseUrl}/${locale}/recognitions`,
      siteName: "Foor.dev",
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: currentSeo.title,
      description: currentSeo.description,
    },
  };
}

export default async function RecognitionsPage({ params }: RecognitionsProps) {
  const { locale } = await params;
  
  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Recognitions & Media Publications",
            "description": "Portfolio of professional recognitions, awards, and media publications",
            "url": `https://foor.dev/${locale}/recognitions`,
            "about": {
              "@type": "Person",
              "name": "Fortino Romero Mantilla",
              "jobTitle": "AWS Cloud Engineer",
              "url": "https://foor.dev",
              "sameAs": [
                "https://linkedin.com/in/fortino-romero-mantilla",
                "https://github.com/netfoor",
                "https://instagram.com/foor.rm"
              ]
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "Professional Recognitions and Publications",
              "description": "Collection of awards, honors, and media features across various platforms"
            }
          })
        }}
      />

      <main className="min-h-screen">
        {/* Header con controles de idioma y tema */}
        <HeaderControls />

        {/* Sección Recognitions completa */}
        <RecognitionsPublicationsSection />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
