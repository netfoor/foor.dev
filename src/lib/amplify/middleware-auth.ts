/**
 * Utility functions for verifying tokens in Next.js middleware
 * This handles both the Amplify token verification and direct cookie-based verification
 * which is more suitable for middleware environments
 */
import { fetchAuthSession } from 'aws-amplify/auth';

// Verification function that supports middleware's limited environment
export async function verifyTokensInMiddleware(request: Request): Promise<{
  isValid: boolean;
  tokens?: any;
}> {
  try {
    // First, check for our custom cookie flags that we sync from client
    const cookies = parseCookies(request.headers.get('cookie') || '');
    
    // If we have our custom auth cookies, use those for verification
    if (cookies.is_authenticated === 'true' && 
        cookies.auth_id_token && 
        cookies.auth_access_token) {
      
      // Verify token validity (basic JWT structure validation)
      const idTokenValid = isValidJWT(cookies.auth_id_token);
      const accessTokenValid = isValidJWT(cookies.auth_access_token);
      
      if (idTokenValid && accessTokenValid) {
        // Extract basic information from tokens
        try {
          const idTokenPayload = parseJWTPayload(cookies.auth_id_token);
          const isExpired = idTokenPayload.exp * 1000 < Date.now();
            if (isExpired) {
            return { isValid: false };
          }
          
          return {
            isValid: true,
            tokens: {
              idToken: cookies.auth_id_token,
              accessToken: cookies.auth_access_token,
              payload: idTokenPayload
            }
          };        } catch (parseError) {
          return { isValid: false };
        }
      } else {
        return { isValid: false };
      }
    } else {
      // No auth cookies found
    }
    
    // Fall back to standard Amplify token verification if cookie approach fails
    return { isValid: false };
  } catch (error) {
    return { isValid: false };
  }
}

// Parse cookies from the cookie header
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

// Basic validation of JWT format
function isValidJWT(token: string): boolean {
  if (!token) return false;
  
  const parts = token.split('.');
  return parts.length === 3;
}

// Parse the payload from a JWT
function parseJWTPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  const base64Payload = parts[1];
  const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
  return payload;
}
