import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../../../amplify_outputs.json';

let isInitialized = false;

export const initializeAmplify = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    // Configurar Amplify con opciones específicas para mejorar la persistencia de sesión
    const config = {
      ...amplifyOutputs,
      // Asegurarnos que se use la configuración adecuada para middleware
      Auth: {
        Cognito: {
          ...amplifyOutputs.auth,
          // Enhanced cookie configuration for middleware compatibility
          cookieStorage: {
            domain: window.location.hostname,
            path: '/',
            expires: 365, // días
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          },
          // Set to use cookies for token storage, ensuring middleware can access them
          tokenCookieStorage: {
            domain: window.location.hostname,
            path: '/',
            expires: 365, // días
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true, // Important for security and middleware access
            sameSite: 'strict'
          }
        }
      }
    };    Amplify.configure(config, { ssr: true });
    
    isInitialized = true;
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};
