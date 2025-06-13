import { NextRequest, NextResponse } from 'next/server';
import { verifyTokens } from '@/lib/amplify/auth';
import { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  LOCALE_COOKIE,
  debugLog
} from '@/lib/i18n/config';
import type { SupportedLocale } from '@/lib/i18n/types';
import negotiator from 'negotiator';

// Rutas que están protegidas y requieren autenticación en el middleware
const PROTECTED_ROUTES = ['/profile', '/dashboard'];

// Rutas que requieren permisos de administrador EN EL MIDDLEWARE
const ADMIN_ROUTES: string[] = [];

// Rutas públicas (no requieren autenticación en middleware)
const PUBLIC_ROUTES = ['/', '/login', '/auth/callback', '/access-denied', '/admin'];

/**
 * Función para verificar si una ruta comienza con alguno de los prefijos dados
 */
function isProtectedByPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => path.startsWith(prefix));
}

/**
 * Construye una ruta localizada con el formato /[locale]/path
 */
function buildLocalizedPath(path: string, locale: SupportedLocale): string {
  // Remover barra inicial si existe para evitar doble barra
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}${cleanPath ? '/' + cleanPath : ''}`;
}

/**
 * Obtiene un locale válido desde un string de idioma
 */
function getValidLocale(language: string): SupportedLocale {
  const locale = language.split('-')[0];
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale) 
    ? locale as SupportedLocale 
    : DEFAULT_LOCALE;
}

/**
 * Detecta el locale preferido del usuario desde cookies y headers
 */
function detectLocaleFromRequest(request: NextRequest): SupportedLocale {
  // 1. Verificar cookie primero (mayor prioridad)
  const localeCookie = request.cookies.get(LOCALE_COOKIE.name);
  if (localeCookie?.value && SUPPORTED_LOCALES.includes(localeCookie.value as SupportedLocale)) {
    debugLog('locale-detection', 'Locale detected from cookie in middleware', { locale: localeCookie.value });
    return localeCookie.value as SupportedLocale;
  }

  // 2. Analizar header Accept-Language
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = new negotiator({ headers: { 'accept-language': acceptLanguage } }).languages();
    
    for (const language of languages) {
      const validLocale = getValidLocale(language);
      if (validLocale !== DEFAULT_LOCALE || language.startsWith(DEFAULT_LOCALE)) {
        debugLog('locale-detection', 'Locale detected from headers in middleware', { 
          locale: validLocale,
          acceptLanguage 
        });
        return validLocale;
      }
    }
  }

  // 3. Fallback al locale por defecto
  debugLog('locale-detection', 'Using default locale in middleware', { locale: DEFAULT_LOCALE });
  return DEFAULT_LOCALE;
}

/**
 * Procesa la internacionalización de la request
 */
function processI18n(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // Si es la ruta raíz, el redirect se maneja en page.tsx
  if (pathname === '/') {
    return null;
  }
  
  // Verificar si la ruta comienza con un locale válido
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  // Si no es un locale válido, puede ser una ruta API u otra ruta especial
  if (!SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
    return null; // Dejar que otras rutas pasen sin modificación
  }
  
  // El locale es válido, establecer cookie si es diferente al actual
  const currentLocale = firstSegment as SupportedLocale;
  const cookieLocale = request.cookies.get(LOCALE_COOKIE.name)?.value;
  
  if (cookieLocale !== currentLocale) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE.name, currentLocale, {
      maxAge: LOCALE_COOKIE.maxAge,
      httpOnly: LOCALE_COOKIE.httpOnly,
      secure: LOCALE_COOKIE.secure,
      sameSite: LOCALE_COOKIE.sameSite
    });
    
    debugLog('locale-detection', 'Updating locale cookie from URL', {
      pathLocale: currentLocale,
      cookieLocale
    });
    
    return response;
  }
  
  return null; // No hay cambios necesarios para i18n
}

/**
 * Función para verificar si un usuario es administrador basado en tokens
 */
function isUserAdmin(tokens: any): boolean {
  try {
    if (!tokens || !tokens.accessToken) return false;
    
    // Decodificar el token de acceso (parte del payload, que es la segunda parte del JWT)
    const tokenString = tokens.accessToken.toString();
    const parts = tokenString.split('.');
    
    if (parts.length !== 3) {
      console.error('Token inválido: no tiene el formato JWT esperado');
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
      console.log('Usuario pertenece al grupo ADMINS');
      return true;
    }
    
    // Si no hay grupos o no pertenece a ADMINS, retornar false
    console.log('Usuario no pertenece al grupo ADMINS:', 
      payload['cognito:groups'] || 'No tiene grupos');
    
    return false;
  } catch (error) {
    console.error('Error verificando permisos de administrador en middleware:', error);
    return false;
  }
}

/**
 * Middleware de Next.js que combina autenticación e internacionalización
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir acceso a recursos estáticos y API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 1. PROCESAR INTERNACIONALIZACIÓN PRIMERO
  const i18nResponse = processI18n(request);
  if (i18nResponse) {
    return i18nResponse; // Retornar redirect o response con cookie actualizada
  }
  // 2. EXTRAER INFORMACIÓN DE LOCALE PARA LAS VERIFICACIONES DE AUTH
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  // Determinar si tenemos un locale en la URL y extraer la ruta sin locale
  let currentLocale: SupportedLocale = DEFAULT_LOCALE;
  let pathnameWithoutLocale = pathname;
  
  if (SUPPORTED_LOCALES.includes(firstSegment as SupportedLocale)) {
    currentLocale = firstSegment as SupportedLocale;
    pathnameWithoutLocale = '/' + pathSegments.slice(1).join('/');
    // Asegurar que pathnameWithoutLocale no sea vacío
    if (pathnameWithoutLocale === '/' && pathSegments.length === 1) {
      pathnameWithoutLocale = '/';
    }
  }
  
  // Normalizar las rutas públicas para verificación (sin prefijo de locale)
  const normalizedPathname = pathnameWithoutLocale;
  
  // Permitir acceso a rutas públicas sin verificación de autenticación
  if (PUBLIC_ROUTES.includes(normalizedPathname) || 
      normalizedPathname.startsWith('/login') ||
      normalizedPathname.startsWith('/auth/') ||
      normalizedPathname.startsWith('/admin')) { // Permitir /admin y sub-rutas para AuthGuard
    return NextResponse.next();
  }

  // 3. VERIFICAR AUTENTICACIÓN PARA RUTAS PROTEGIDAS
  try {
    if (isProtectedByPrefix(normalizedPathname, PROTECTED_ROUTES)) {
      // Verificar la autenticación del usuario
      const { isValid, tokens } = await verifyTokens();
      
      console.log(`Middleware: Verificando acceso a ${pathname}`, { 
        isValid, 
        hasTokens: !!tokens,
        normalizedPath: normalizedPathname
      });
      
      if (!isValid) {
        // Construir URL de login con locale y returnUrl
        const returnUrl = encodeURIComponent(pathname);
        const loginPath = buildLocalizedPath('/login', currentLocale);
        const loginUrl = new URL(`${loginPath}?returnUrl=${returnUrl}`, request.url);
        
        console.log(`Middleware: Redirigiendo a login, returnUrl=${returnUrl}`);
        return NextResponse.redirect(loginUrl);
      }
      
      // Verificar permisos de administrador para rutas de administración
      if (isProtectedByPrefix(normalizedPathname, ADMIN_ROUTES)) {
        const hasAdminRole = isUserAdmin(tokens);
        
        console.log(`Middleware: Verificando rol de admin para ${pathname}`, { 
          hasAdminRole 
        });
        
        if (!hasAdminRole) {
          // Redirigir a página de acceso denegado con locale
          const accessDeniedPath = buildLocalizedPath('/access-denied', currentLocale);
          const accessDeniedUrl = new URL(accessDeniedPath, request.url);
          
          console.log(`Middleware: Usuario no es admin, redirigiendo a ${accessDeniedPath}`);
          return NextResponse.redirect(accessDeniedUrl);
        }
      }
    }
    
    // Si pasa todas las verificaciones, permitir acceso
    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    // En caso de error, redirigir al login con locale
    const loginPath = buildLocalizedPath('/login', currentLocale);
    const loginUrl = new URL(`${loginPath}?error=session_error`, request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Configuración para las rutas que deben pasar por el middleware
 */
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. Archivos estáticos (_next/static, favicon.ico, etc.)
     * 2. API routes (/api/*)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
