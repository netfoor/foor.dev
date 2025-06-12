import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../../../amplify_outputs.json';

let isInitialized = false;

export const initializeAmplify = () => {
  if (typeof window === 'undefined') {
    console.log('Amplify configuration skipped (server-side).');
    return;
  }

  if (isInitialized) {
    console.log('Amplify already initialized.');
    return;
  }

  try {
    // Configurar Amplify con opciones específicas para mejorar la persistencia de sesión
    const config = {
      ...amplifyOutputs,
      // Asegurarnos que se use localStorage para la persistencia
      Auth: {
        Cognito: {
          ...amplifyOutputs.auth,
          // Configuración para asegurar que la sesión persista entre navegaciones
          storage: localStorage,
          cookieStorage: {
            domain: window.location.hostname,
            path: '/',
            expires: 365, // días
            secure: process.env.NODE_ENV === 'production'
          }
        }
      }
    };

    Amplify.configure(config, { ssr: true });
    
    isInitialized = true;
    console.log('Amplify configured successfully with enhanced session persistence.');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};
