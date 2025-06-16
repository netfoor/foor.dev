# Token Synchronization for Next.js Middleware Authentication

This document explains the comprehensive solution implemented to fix authentication token issues with Next.js middleware.

## The Problem

Next.js middleware runs in a server-side context and cannot access client-side storage (localStorage) where Amplify stores authentication tokens by default. This creates a situation where:

1. Users appear to be authenticated in client components
2. But middleware fails to verify authentication tokens
3. Protected routes redirect to login even for authenticated users

## Our Complete Solution

We've implemented a three-part solution to address this issue:

### 1. Token Synchronization

We created a new utility (`token-sync.ts`) that synchronizes Amplify tokens to cookies that middleware can access:

```typescript
export function setupTokenSync() {
  // Synchronize tokens from Amplify Auth to cookies on:
  // - Initial page load
  // - Window focus events
  // - Regular intervals
  
  // This ensures middleware always has access to current tokens
}
```

### 2. Middleware-Specific Token Verification

We implemented a specialized token verification function for middleware (`middleware-auth.ts`):

```typescript
export async function verifyTokensInMiddleware(request: Request) {
  // Extract tokens from cookies
  // Verify token format and expiration
  // Return authentication status
}
```

### 3. Updated Amplify Configuration

We updated the Amplify configuration to use HTTP-only cookies:

```typescript
const config = {
  ...amplifyOutputs,
  Auth: {
    Cognito: {
      ...amplifyOutputs.auth,
      cookieStorage: {
        // Cookie configuration optimized for middleware access
      }
    }
  }
};
```

## How It Works Together

1. **Client-Side**: 
   - AmplifyClientProvider initializes Amplify
   - Sets up token synchronization to cookies
   - Maintains tokens in cookies as the user navigates

2. **Middleware**:
   - First tries to verify tokens from cookies
   - Falls back to standard verification if needed
   - Uses enhanced debug logging to trace the verification process

3. **Protected Routes**:
   - Can now properly detect authentication state
   - Allow access to authenticated users
   - Redirect unauthenticated users to login

## Development Bypass Option

For development purposes, you can bypass authentication checks by adding to `.env.local`:

```
NEXT_PUBLIC_BYPASS_AUTH_IN_DEV=true
```

This allows you to access protected routes without valid authentication during development.

## Security Considerations

While our solution works well for development, for production environments:

1. Use server-side cookie setting when possible
2. Ensure all cookies have proper security settings
3. Consider implementing proper CSRF protections
4. Set appropriate cookie expiration policies

## Debugging

Enable detailed debugging by adding to `.env.local`:

```
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will show detailed logs about the token verification process, helping identify issues with authentication.
