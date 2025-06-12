'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from '@/lib/amplify/auth';

/**
 * Página de callback para procesar la autenticación con Cognito Hosted UI
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

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
      let redirectPath = '/admin'; // Valor predeterminado
      
      if (typeof window !== 'undefined') {
        const savedReturnUrl = localStorage.getItem('returnUrl');
        if (savedReturnUrl) {
          redirectPath = savedReturnUrl;
          console.log('URL de retorno recuperada de localStorage:', redirectPath);
        } else {
          console.log('No se encontró URL de retorno en localStorage, usando valor predeterminado');
        }
      }
      
      console.log('Estado de autenticación:', authResult.isAuthenticated);
      console.log('¿Es admin?:', authResult.isAdmin);
      console.log('Redirigiendo a:', redirectPath);
      
      if (authResult.isAuthenticated) {
        // Si el usuario intenta acceder a /admin pero no es administrador, redirigir a la página de acceso denegado
        if ((redirectPath.startsWith('/admin') || redirectPath === '/admin') && !authResult.isAdmin) {
          console.log('Usuario no es administrador, redirigiendo a /access-denied');
          router.push('/access-denied');
        } else {
          // Redirigir al usuario a la ruta solicitada
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
