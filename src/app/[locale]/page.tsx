import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import Hero from '@/components/ui/Hero';
import AboutSection from '@/components/ui/AboutSection';
import Footer from '@/components/ui/Footer';
import type { SupportedLocale } from '@/lib/i18n/types';

interface HomeProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado por idioma
export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('homepage', locale);
  const seoData = {
    en: {
      title: "Foor.dev - AWS Cloud Engineer | DevOps & Serverless Solutions",
      description: "Expert AWS Cloud Engineer specializing in serverless architecture, DevOps automation, and cloud infrastructure. AWS certified professional offering scalable cloud solutions.",
      keywords: "AWS cloud engineer, serverless architecture, DevOps, cloud infrastructure, AWS Lambda, Infrastructure as Code, cloud migration, AWS solutions"
    },
    es: {
      title: "Foor.dev - Ingeniero en la Nube AWS | Soluciones DevOps y Serverless", 
      description: "Ingeniero en la Nube AWS experto especializado en arquitectura serverless, automatización DevOps e infraestructura en la nube. Profesional certificado en AWS ofreciendo soluciones escalables.",
      keywords: "ingeniero nube AWS, arquitectura serverless, DevOps, infraestructura nube, AWS Lambda, Infraestructura como Código, migración nube, soluciones AWS"
    },
    ja: {
      title: "Foor.dev - AWSクラウドエンジニア | DevOps・サーバーレスソリューション",
      description: "サーバーレスアーキテクチャ、DevOps自動化、クラウドインフラ専門のAWSクラウドエンジニア。AWS認定プロフェッショナルがスケーラブルなクラウドソリューションを提供。",
      keywords: "AWSクラウドエンジニア, サーバーレスアーキテクチャ, DevOps, クラウドインフラ, AWS Lambda, Infrastructure as Code, クラウド移行, AWSソリューション"
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
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`, 
        'ja': `${baseUrl}/ja`,
      },
    },
    openGraph: {
      title: currentSeo.title,
      description: currentSeo.description,
      url: `${baseUrl}/${locale}`,
      siteName: "Foor.dev",
      locale: locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: currentSeo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: currentSeo.title,
      description: currentSeo.description,
      images: [`${baseUrl}/images/og-image.jpg`],
    },
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
    verification: {
      google: "your-google-verification-code", // Reemplazar con tu código real
    },
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  
  // Cargar traducciones
  const tCommon = await getTranslations('common', locale);

  return (
    <>
      {/* Schema.org JSON-LD for SEO */}      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "foor.dev",
            "description": "AWS Cloud Engineering and DevOps services specializing in serverless architecture and cloud infrastructure",
            "url": "https://foor.dev",
            "logo": "https://foor.dev/images/logo.png",
            "sameAs": [
              "https://github.com/netfoor",
              "https://linkedin.com/in/fortino-romero-mantilla",
              "https://instagram.com/foor.rm"
            ],
            "founder": {
              "@type": "Person",
              "name": "Fortino Romero Mantilla",
              "jobTitle": "AWS Cloud Engineer",
              "url": "https://foor.dev",
              "knowsAbout": [
                "AWS",
                "Cloud Computing",
                "Serverless Architecture",
                "DevOps",
                "Infrastructure as Code",
                "AWS Lambda",
                "API Gateway",
                "DynamoDB",
                "CloudFormation",
                "Terraform"
              ]
            },
            "serviceType": [
              "AWS Cloud Architecture",
              "Serverless Application Development",
              "DevOps Pipeline Implementation", 
              "Cloud Migration Services",
              "Infrastructure as Code",
              "AWS Consulting"
            ],
            "areaServed": "Worldwide",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "AWS Cloud Engineering Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AWS Cloud Architecture Design"
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Serverless Application Development"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "DevOps Automation & CI/CD Pipelines"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Cloud Migration & Optimization"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Infrastructure as Code Implementation"
                  }
                }
              ]
            }
          })
        }}
      />      <main className="min-h-screen">
        {/* Header con controles de idioma y tema */}
        <HeaderControls />

        {/* Componente Hero SEO optimizado */}
        <Hero />

        {/* Sección About - Información profesional y logros */}
        <AboutSection />
      </main>

      {/* Footer - Pie de página con información de contacto y enlaces */}
      <Footer />
    </>
  );
}
