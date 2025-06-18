import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from '@/lib/i18n/server';
import HeaderControls from '@/components/ui/HeaderControls';
import ProjectsSection from '@/components/ui/ProjectsSection';
import Footer from '@/components/ui/Footer';
import type { SupportedLocale } from '@/lib/i18n/types';

interface ProjectsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

// Metadata SEO optimizado para la página de Projects
export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  
  const seoData = {
    en: {
      title: "AWS Cloud Projects - DevOps & Serverless Solutions | Foor.dev",
      description: "Explore my AWS cloud projects, serverless applications, and DevOps innovations. Real-world solutions using AWS Lambda, CloudFormation, and modern cloud technologies.",
      keywords: "AWS cloud projects, serverless applications, DevOps automation, cloud solutions, AWS Lambda projects, Infrastructure as Code, cloud architecture"
    },
    es: {
      title: "Proyectos en la Nube AWS - Soluciones DevOps y Serverless | Foor.dev", 
      description: "Explora mis proyectos en la nube AWS, aplicaciones serverless e innovaciones DevOps. Soluciones del mundo real usando AWS Lambda, CloudFormation y tecnologías modernas en la nube.",
      keywords: "proyectos nube AWS, aplicaciones serverless, automatización DevOps, soluciones nube, proyectos AWS Lambda, Infraestructura como Código, arquitectura nube"
    },
    ja: {
      title: "AWSクラウドプロジェクト - DevOps・サーバーレスソリューション | Foor.dev",
      description: "AWSクラウドプロジェクト、サーバーレスアプリケーション、DevOpsイノベーションをご覧ください。AWS Lambda、CloudFormation、現代のクラウド技術を使用した実世界のソリューション。",
      keywords: "AWSクラウドプロジェクト, サーバーレスアプリケーション, DevOps自動化, クラウドソリューション, AWS Lambdaプロジェクト, Infrastructure as Code, クラウドアーキテクチャ"
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
      url: `${baseUrl}/${locale}/projects`,
      siteName: "Foor.dev",
      images: [
        {
          url: `${baseUrl}/images/profile.jpeg`,
          width: 1200,
          height: 630,
          alt: "Fortino Romero Mantilla - AWS Cloud Engineer Projects",
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
      canonical: `${baseUrl}/${locale}/projects`,
      languages: {
        'en': `${baseUrl}/en/projects`,
        'es': `${baseUrl}/es/projects`,
        'ja': `${baseUrl}/ja/projects`,
      },
    },
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
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
            "name": "AWS Cloud Projects",
            "description": "Portfolio of AWS cloud projects, serverless applications, and DevOps innovations",
            "url": `https://foor.dev/${locale}/projects`,
            "about": {
              "@type": "Person",
              "name": "Fortino Romero Mantilla",
              "jobTitle": "AWS Cloud Engineer",
              "url": "https://foor.dev",
              "sameAs": [
                "https://linkedin.com/in/fortino-romero-mantilla",
                "https://github.com/FortinRm",
                "https://instagram.com/foor.rm"
              ]
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "AWS Cloud Projects",
              "description": "Collection of cloud engineering projects and solutions"
            }
          })
        }}
      />

      <main className="min-h-screen">
        {/* Header con controles de idioma y tema */}
        <HeaderControls />        {/* Sección Projects completa */}
        <ProjectsSection showAll={true} />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
