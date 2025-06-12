import { NextRequest, NextResponse } from 'next/server';
import { verifyTokens } from '@/lib/amplify/auth';

// Rutas que están protegidas y requieren autenticación en el middleware
const PROTECTED_ROUTES = ['/profile', '/dashboard'];

// Rutas que requieren permisos de administrador EN EL MIDDLEWARE
// Quitamos /admin porque AuthGuard lo maneja en el cliente
const ADMIN_ROUTES: string[] = [];

// Rutas públicas (no requieren autenticación en middleware)
// /admin se maneja con AuthGuard en el cliente para mejor compatibilidad con Amplify
const PUBLIC_ROUTES = ['/', '/login', '/auth/callback', '/access-denied', '/admin'];

/**
 * Función para verificar si una ruta comienza con alguno de los prefijos dados
 */
function isProtectedByPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => path.startsWith(prefix));
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
 * Middleware de Next.js para proteger rutas basado en autenticación
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
  // Permitir acceso a rutas públicas sin verificación
  if (PUBLIC_ROUTES.includes(pathname) || 
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/admin')) { // Permitir /admin y sub-rutas para AuthGuard
    return NextResponse.next();
  }

  try {      // Verificar tokens para rutas protegidas
      if (isProtectedByPrefix(pathname, PROTECTED_ROUTES)) {
        // Verificar la autenticación del usuario
        const { isValid, tokens } = await verifyTokens();
        
        console.log(`Middleware: Verificando acceso a ${pathname}`, { 
          isValid, 
          hasTokens: !!tokens 
        });
        
        if (!isValid) {
          // Guardar la URL actual para redirigir después del login
          const returnUrl = encodeURIComponent(pathname);
          console.log(`Middleware: Redirigiendo a login, returnUrl=${returnUrl}`);
          return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
        }
        
        // Verificar permisos de administrador para rutas de administración
        if (isProtectedByPrefix(pathname, ADMIN_ROUTES)) {
          const hasAdminRole = isUserAdmin(tokens);
          
          console.log(`Middleware: Verificando rol de admin para ${pathname}`, { 
            hasAdminRole 
          });
          
          if (!hasAdminRole) {
            // Redirigir a página de acceso denegado
            console.log(`Middleware: Usuario no es admin, redirigiendo a /access-denied`);
            return NextResponse.redirect(new URL('/access-denied', request.url));
          }
        }
      }
    
    // Si pasa todas las verificaciones, permitir acceso
    return NextResponse.next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    // En caso de error, redirigir al login
    return NextResponse.redirect(new URL('/login?error=session_error', request.url));
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
