# Profile Page Authentication Guide

This document explains how authentication works for the profile page and provides troubleshooting steps for common issues.

## Authentication Architecture

The authentication in our application works at multiple levels:

1. **Middleware Level**: Server-side authentication check using token verification
2. **Client Component Level**: Client-side authentication state management with the `AuthGuard` component
3. **Context Level**: Application-wide authentication state via `auth-context.tsx`

## Profile Page Access Control

The profile page has been configured as a protected route that:

1. Requires authentication (any authenticated user can access it)
2. Uses the `AuthGuard` component to manage client-side authentication state
3. Will redirect unauthenticated users to the login page with a `returnUrl` parameter

## Common Issues and Solutions

### Redirect Loop Issue

**Symptom**: Being continuously redirected between the profile page and login page even when you're authenticated.

**Possible Causes**:
1. Token validation is failing in the middleware
2. Client-side and server-side authentication state are out of sync
3. Cookie issues preventing proper authentication state persistence

**Solutions**:

1. **Clear Browser Cache and Cookies**: 
   - This helps resolve issues with stale or corrupted authentication tokens

2. **Force Re-login**:
   - Sign out completely and sign back in to get fresh tokens

3. **Check Browser Console**:
   - Look for authentication-related errors in the console logs

4. **Verify Network Requests**:
   - Check the Network tab in DevTools to see if token refresh requests are failing

### Server-Side vs. Client-Side Authentication

Our application uses a dual authentication approach:

1. **Server-Side (Middleware)**: 
   - Validates tokens on each request
   - Redirects unauthenticated users to login
   - Runs before any page components

2. **Client-Side (AuthGuard)**:
   - Manages authentication state in the browser
   - Handles redirects within the client-side router
   - Provides better user experience with loading states

When these get out of sync, you may experience issues like:
- Page initially loads but then redirects to login
- Flash of content before redirect
- Unexpected access denied messages

## How to Test Authentication

To properly test the profile page authentication:

1. **Clear Authentication State**:
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

2. **Sign In with Different Roles**:
   - Test with regular user account
   - Test with admin account
   - Test with unauthenticated state

3. **Verify Proper Redirects**:
   - Unauthenticated → Login page with returnUrl
   - Authenticated → Profile page content displays correctly

## Recent Fix

We've updated the profile page to use the `AuthGuard` component to ensure consistent authentication behavior. This ensures that:

1. The client component receives proper authentication state
2. Loading states are shown during authentication checks
3. Unauthenticated users are properly redirected

If you're still experiencing issues, please check your browser console for errors and verify that your authentication tokens are valid.
