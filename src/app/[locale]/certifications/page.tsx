import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import CertificationsSection from '@/components/ui/CertificationsSection';
import Footer from '@/components/ui/Footer';
import type { SupportedLocale } from '@/lib/i18n/types';

interface CertificationsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para la página de Certificaciones
export async function generateMetadata({ params }: CertificationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "AWS Certifications & Professional Credentials | Foor.dev",
      description: "View my AWS certifications and professional credentials. Cloud computing certifications, DevOps qualifications, and technical achievements from industry leaders.",
      keywords: "AWS certifications, cloud certifications, professional credentials, DevOps certifications, AWS Solutions Architect, AWS Developer Associate, cloud computing qualifications"
    },
    es: {
      title: "Certificaciones AWS y Credenciales Profesionales | Foor.dev", 
      description: "Ve mis certificaciones AWS y credenciales profesionales. Certificaciones de computación en la nube, calificaciones DevOps y logros técnicos de líderes de la industria.",
      keywords: "certificaciones AWS, certificaciones nube, credenciales profesionales, certificaciones DevOps, AWS Solutions Architect, AWS Developer Associate, calificaciones computación nube"
    },
    ja: {
      title: "AWS認定・プロフェッショナル資格 | Foor.dev",
      description: "AWS認定とプロフェッショナル資格をご覧ください。クラウドコンピューティング認定、DevOps資格、業界リーダーからの技術的成果。",
      keywords: "AWS認定, クラウド認定, プロフェッショナル資格, DevOps認定, AWS Solutions Architect, AWS Developer Associate, クラウドコンピューティング資格"
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
      url: `${baseUrl}/${locale}/certifications`,
      siteName: "Foor.dev",
      images: [
        {
          url: `${baseUrl}/images/profile.jpeg`,
          width: 1200,
          height: 630,
          alt: "Fortino Romero Mantilla - AWS Cloud Engineer Certifications",
        },
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: currentSeo.title,
      description: currentSeo.description,
      images: [`${baseUrl}/images/profile.jpeg`],
      creator: "@foor_rm",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/certifications`,
      languages: {
        'en': `${baseUrl}/en/certifications`,
        'es': `${baseUrl}/es/certifications`,
        'ja': `${baseUrl}/ja/certifications`,
      },
    },
  };
}

export default async function CertificationsPage({ params }: CertificationsPageProps) {
  const { locale } = await params;

  return (
    <>
      {/* Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "AWS Certifications & Professional Credentials",
            "description": "Portfolio of AWS certifications and professional credentials from industry leaders",
            "url": `https://foor.dev/${locale}/certifications`,
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
              "name": "Professional Certifications",
              "description": "Collection of cloud computing and technical certifications"
            }
          })
        }}
      />

      <main className="min-h-screen">
        {/* Header con controles de idioma y tema */}
        <HeaderControls />

        {/* Sección Certifications completa */}
        <div style={{ paddingBottom: '4rem' }}>
          <CertificationsSection showAll={true} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
