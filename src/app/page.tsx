import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import negotiator from 'negotiator';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';

export default async function RootPage() {
  // Detectar idioma preferido del usuario
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  let preferredLocale: SupportedLocale = DEFAULT_LOCALE;
  
  if (acceptLanguage) {
    const languages = new negotiator({ 
      headers: { 'accept-language': acceptLanguage } 
    }).languages();
    
    for (const language of languages) {
      const locale = language.split('-')[0];
      if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
        preferredLocale = locale as SupportedLocale;
        break;
      }
    }
  }
  
  // Redirigir a la versión localizada
  redirect(`/${preferredLocale}`);
}
