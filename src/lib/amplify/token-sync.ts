'use client';

import { fetchAuthSession } from 'aws-amplify/auth';
import Cookies from 'js-cookie';

/**
 * Handles synchronizing Amplify tokens to HTTP cookies to make them available to middleware
 * This is necessary because Next.js middleware can only access cookies, not localStorage
 */
export function setupTokenSync() {
  if (typeof window === 'undefined') return;
  // Define cookie options that make them accessible to middleware
  const cookieOptions = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as 'strict',
    expires: 7 // 7 days expiration
  };

  // Function to synchronize tokens from Amplify to cookies
  const syncTokensToCookies = async () => {
    try {
      const session = await fetchAuthSession();
        if (session.tokens) {
        // Store the tokens in cookies that can be accessed by middleware
        // Note: In a real app you should be careful with this approach for security reasons
        // For maximum security, these should be HTTP-only cookies set from the server
        // This is a development-focused solution
        if (session.tokens.idToken) {
          Cookies.set('auth_id_token', session.tokens.idToken.toString(), cookieOptions);
        }
        
        if (session.tokens.accessToken) {
          Cookies.set('auth_access_token', session.tokens.accessToken.toString(), cookieOptions);
        }
          // Also set a simple flag that middleware can check quickly
        Cookies.set('is_authenticated', 'true', cookieOptions);
      } else {
        // Clear cookies if no tokens are present
        Cookies.remove('auth_id_token', { path: '/' });
        Cookies.remove('auth_access_token', { path: '/' });
        Cookies.remove('is_authenticated', { path: '/' });
      }
    } catch (error) {
      console.error('Error synchronizing tokens to cookies:', error);
    }
  };

  // Run once on initialization
  syncTokensToCookies();

  // Set up event listeners to keep tokens in sync
  window.addEventListener('focus', syncTokensToCookies);
  
  // Set up interval to periodically sync tokens (every minute)
  const interval = setInterval(syncTokensToCookies, 60 * 1000);
  
  // Clean up on unmount
  return () => {
    window.removeEventListener('focus', syncTokensToCookies);
    clearInterval(interval);
  };
}

/**
 * Hook to use in the main layout or app component to enable token synchronization
 */
export function useTokenSync() {
  if (typeof window === 'undefined') return;
  
  // Set up the token sync on first render
  setupTokenSync();
}
