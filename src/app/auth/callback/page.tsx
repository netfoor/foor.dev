'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from '@/lib/amplify/auth';
import { LOCALE_COOKIE, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';

/**
 * Página de callback para procesar la autenticación con Cognito Hosted UI
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();  
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Función para detectar el locale del usuario
  const getLocaleFromCookie = (): SupportedLocale => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${LOCALE_COOKIE.name}=`)
      );
      
      if (localeCookie) {
        const locale = localeCookie.split('=')[1];
        if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
          return locale as SupportedLocale;
        }
      }
    }
    return DEFAULT_LOCALE;
  };

  // Función para construir ruta localizada
  const buildLocalizedPath = (path: string, locale: SupportedLocale): string => {
    // Si la ruta ya tiene un locale, la mantener como está
    const pathSegments = path.split('/').filter(Boolean);
    if (SUPPORTED_LOCALES.includes(pathSegments[0] as SupportedLocale)) {
      return path;
    }
    
    // Agregar locale a la ruta
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
  };

  // Función para manejar la redirección después de la autenticación
  const completeAuthAndRedirect = async () => {
    // Evitar múltiples ejecuciones
    if (hasProcessed) {
      console.log('Ya se procesó la autenticación, evitando duplicación');
      return;
    }
    
    setHasProcessed(true);
    try {
      // Verificar si la autenticación fue exitosa
      const authResult = await getCurrentUser();
      
      // Imprimir todos los parámetros de la URL para diagnóstico
      console.log('Parámetros de URL en callback:', {
        code: searchParams.get('code'),
        state: searchParams.get('state'),
        customState: searchParams.get('customState'),
        all: Object.fromEntries([...searchParams.entries()])
      });
        // Recuperar la URL de retorno del localStorage
      const currentLocale = getLocaleFromCookie();
      let redirectPath = `/${currentLocale}/admin`; // Valor predeterminado localizado
      
      if (typeof window !== 'undefined') {
        const savedReturnUrl = localStorage.getItem('returnUrl');
        if (savedReturnUrl) {
          // Asegurar que la URL guardada esté localizada
          redirectPath = buildLocalizedPath(savedReturnUrl, currentLocale);
          console.log('URL de retorno recuperada de localStorage:', savedReturnUrl, '-> localizada:', redirectPath);
        } else {
          console.log('No se encontró URL de retorno en localStorage, usando valor predeterminado localizado:', redirectPath);
        }
        
        // Limpiar localStorage
        localStorage.removeItem('returnUrl');
      }
      
      console.log('Estado de autenticación:', authResult.isAuthenticated);
      console.log('¿Es admin?:', authResult.isAdmin);
      console.log('Redirigiendo a:', redirectPath);
        if (authResult.isAuthenticated) {
        // Extraer la ruta sin locale para verificación
        const pathSegments = redirectPath.split('/').filter(Boolean);
        const localeSegment = pathSegments[0];
        const pathWithoutLocale = SUPPORTED_LOCALES.includes(localeSegment as SupportedLocale)
          ? '/' + pathSegments.slice(1).join('/')
          : redirectPath;
        
        // Si el usuario intenta acceder a /admin pero no es administrador, redirigir a la página de acceso denegado
        if ((pathWithoutLocale.startsWith('/admin') || pathWithoutLocale === '/' || pathWithoutLocale === '/admin') && !authResult.isAdmin) {
          const accessDeniedPath = `/${currentLocale}/access-denied`;
          console.log('Usuario no es administrador, redirigiendo a:', accessDeniedPath);
          router.push(accessDeniedPath);
        } else {
          // Redirigir al usuario a la ruta solicitada
          console.log('Usuario autenticado correctamente, redirigiendo a:', redirectPath);
          router.push(redirectPath);
        }      } else {
        // Si por alguna razón no está autenticado después del callback
        setError('No se pudo completar la autenticación. Por favor, intenta nuevamente.');
        setIsProcessing(false);
        setHasProcessed(false); // Permitir reintentar
      }
    } catch (err) {
      console.error('Error procesando callback de autenticación:', err);
      setError('Error procesando la autenticación. Por favor, intenta nuevamente.');
      setIsProcessing(false);
      setHasProcessed(false); // Permitir reintentar
    }
  };  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    let timeoutId: NodeJS.Timeout;
    
    const processAuth = async () => {
      try {
        // Esperar un momento para que Amplify procese completamente el callback
        await new Promise(resolve => setTimeout(resolve, 500));
        await completeAuthAndRedirect();
      } catch (err) {
        console.error('Error en el procesamiento inicial:', err);
        // Si falla, reintentar después de un breve delay
        timeoutId = setTimeout(() => {
          if (!hasProcessed) {
            setHasProcessed(false);
            completeAuthAndRedirect();
          }
        }, 1000);
      }
    };

    processAuth();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Solo ejecutar una vez al montar
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Procesando autenticación
        </h1>
        
        {error ? (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Volver al login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-center">
              Completando el proceso de inicio de sesión...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
