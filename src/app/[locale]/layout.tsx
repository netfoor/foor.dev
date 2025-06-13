import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import type { SupportedLocale } from "@/lib/i18n/types";
import { I18nProvider } from "@/components/providers/I18nProvider";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Verificar que el locale es válido
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    notFound();
  }

  return (
    <I18nProvider locale={locale as SupportedLocale}>
      {children}
    </I18nProvider>
  );
}

// Generar metadata dinámica basada en el locale
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "Foor.dev",
    description: "Aplicación Next.js con autenticación usando AWS Amplify",
  };
}

// Generar rutas estáticas para todos los locales soportados
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale: locale,
  }));
}
