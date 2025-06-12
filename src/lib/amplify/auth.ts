/**
 * Utilidades de autenticación para AWS Amplify v6
 * Este archivo proporciona funciones para manejar la autenticación con AWS Cognito
 */
import { 
  fetchAuthSession, 
  signOut as amplifySignOut, 
  fetchUserAttributes, 
  signInWithRedirect, 
  getCurrentUser as amplifyGetCurrentUser,
  type AuthUser
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

/**
 * Clase de error personalizada para usuario ya autenticado
 */
export class UserAlreadyAuthenticatedException extends Error {
  constructor(message = 'The user is already authenticated') {
    super(message);
    this.name = 'UserAlreadyAuthenticatedException';
  }
}

/**
 * Interfaz para la respuesta del usuario actual
 */
export interface CurrentUserResponse {
  user: AuthUser | null;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  attributes?: Record<string, any>;
}

/**
 * Opciones para el inicio de sesión
 */
export interface SignInOptions {
  redirectUri?: string;
  customState?: string;
}

/**
 * Obtiene el usuario actual desde Cognito
 * @returns Promise con la información del usuario actual
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  try {
    // Intentar obtener el usuario actual
    const authSession = await fetchAuthSession();
    
    if (!authSession.tokens) {
      throw new Error('No authenticated user');
    }
    
    try {
      const user = await amplifyGetCurrentUser();
      
      try {
        const attributes = await fetchUserAttributes();
        
        // Verificar si el usuario es administrador
        const isAdmin = checkIsAdmin(authSession.tokens);
        
        return {
          user,
          error: null,
          isAuthenticated: true,
          isAdmin,
          attributes
        };
      } catch (attributesError) {
        // Si no podemos obtener atributos pero tenemos el usuario, seguimos considerándolo autenticado
        return {
          user,
          error: attributesError as Error,
          isAuthenticated: true,
          isAdmin: false
        };
      }
    } catch (userError) {
      // Si tenemos tokens pero no podemos obtener el usuario, consideramos que hay un problema de sesión
      return {
        user: null,
        error: userError as Error,
        isAuthenticated: false,
        isAdmin: false
      };
    }
  } catch (error) {
    return {
      user: null,
      error: error as Error,
      isAuthenticated: false,
      isAdmin: false
    };
  }
}

/**
 * Inicia sesión con el Hosted UI de Cognito
 * @param options Opciones para el inicio de sesión
 */
export async function signInWithHostedUI(options?: SignInOptions): Promise<void> {
  try {
    // Comprobar si el usuario ya está autenticado
    try {
      const currentSession = await fetchAuthSession();
      if (currentSession.tokens) {
        // No redirigir a Cognito si ya está autenticado
        throw new UserAlreadyAuthenticatedException();
      }
    } catch (sessionError) {
      // Ignorar errores específicos de sesión no encontrada, continuar con el flujo de login
      if (!(sessionError instanceof UserAlreadyAuthenticatedException)) {
        // Continuar con el flujo de login
      } else {
        throw sessionError; // Re-lanzar error de usuario ya autenticado
      }
    }
    
    // Determinar la URL actual o la página de inicio como estado personalizado predeterminado
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    // Usar la ruta actual como customState si no se proporciona
    const customState = options?.customState || currentPath;
    
    // URI de redirección personalizado o predeterminado
    const redirectUri = options?.redirectUri || 
      `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
    
    // Guardar la URL de retorno en localStorage para recuperarla después del login
    if (typeof window !== 'undefined') {
      // Si estamos en la página de login, usar el returnUrl de la URL si existe
      if (currentPath === '/login') {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        if (returnUrl) {
          localStorage.setItem('returnUrl', decodeURIComponent(returnUrl));
        } else {
          localStorage.setItem('returnUrl', '/admin');
        }
      } else {
        localStorage.setItem('returnUrl', customState);
      }
    }
    
    // Configurar la redirección para autenticación
    await signInWithRedirect({
      provider: { custom: 'Cognito' }
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Cierra la sesión del usuario actual
 * @param global Si es true, cierra sesión en todos los dispositivos
 * @returns Promise que se resuelve después de cerrar sesión
 */
export async function signOut(global: boolean = false): Promise<void> {
  try {
    await amplifySignOut(global ? { global: true } : undefined);
  } catch (error) {
    throw error;
  }
}

/**
 * Verifica si el usuario tiene el rol de administrador
 * @param tokens Tokens de la sesión actual
 * @returns true si el usuario es administrador
 */
export function checkIsAdmin(tokens: any): boolean {
  if (!tokens || !tokens.accessToken) return false;
  
  try {
    // Decodificar el token de acceso (parte del payload, que es la segunda parte del JWT)
    const tokenString = tokens.accessToken.toString();
    const parts = tokenString.split('.');
    
    if (parts.length !== 3) {
      return false;
    }
    
    // Decodificar el payload (segunda parte del JWT)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    );
    
    // Verificar si el usuario pertenece al grupo ADMINS
    if (payload['cognito:groups'] && 
        Array.isArray(payload['cognito:groups']) && 
        payload['cognito:groups'].includes('ADMINS')) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Verifica los tokens del usuario actual
 * @returns Objeto con el resultado de la verificación
 */
export async function verifyTokens(): Promise<{
  isValid: boolean;
  tokens?: any;
  error?: Error;
}> {
  try {
    // Intentar recuperar sesión existente
    const authSession = await fetchAuthSession({
      forceRefresh: false // Primero intentar usar sesión en caché
    });
    
    // Si no hay tokens o están expirados, intentar refrescar
    if (!authSession.tokens || isTokenExpired(authSession.tokens)) {
      try {
        // Intentar refrescar tokens explícitamente
        const refreshedSession = await fetchAuthSession({
          forceRefresh: true
        });
        
        if (!refreshedSession.tokens) {
          return {
            isValid: false,
            error: new Error('No authenticated session after refresh')
          };
        }
        
        return {
          isValid: true,
          tokens: {
            idToken: refreshedSession.tokens.idToken,
            accessToken: refreshedSession.tokens.accessToken
          }
        };
      } catch (refreshError) {
        return {
          isValid: false,
          error: refreshError as Error
        };
      }
    }
    
    // Si hay tokens válidos
    if (authSession.tokens) {
      return {
        isValid: true,
        tokens: {
          idToken: authSession.tokens.idToken,
          accessToken: authSession.tokens.accessToken
        }
      };
    }
    
    return {
      isValid: false,
      error: new Error('No authenticated session')
    };
  } catch (error) {
    return {
      isValid: false,
      error: error as Error
    };
  }
}

/**
 * Verifica si un token está expirado
 */
function isTokenExpired(tokens: any): boolean {
  if (!tokens || !tokens.accessToken) return true;
  
  try {
    // Decodificar el token para obtener su fecha de expiración
    const tokenString = tokens.accessToken.toString();
    const parts = tokenString.split('.');
    
    if (parts.length !== 3) {
      return true;
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    );
    
    // Verificar si el token ha expirado
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    
    // Si el token expira en menos de 5 minutos, considerarlo expirado
    const expiresInMs = expirationTime - currentTime;
    return expiresInMs < 5 * 60 * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Crea un listener para los eventos de autenticación
 * @param callback Función a ejecutar cuando se produce un evento
 * @returns Función para eliminar el listener
 */
export function createAuthListener(
  callback: (event: string, payload: any) => void
): () => void {
  return Hub.listen('auth', ({ payload }) => {
    callback(payload.event, payload);
  });
}
