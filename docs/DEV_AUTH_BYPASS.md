# Development Bypass for Authentication

This document explains how to use the temporary development bypass for authentication to test if the middleware token verification is the root cause of the authentication issues.

## How to Enable the Bypass

We've added a temporary development bypass for token verification in the middleware. This is **only for development testing** and should not be used in production.

To enable the bypass:

1. Create a `.env.local` file in the root of your project if it doesn't exist
2. Add the following line to bypass authentication checks in development:
   ```
   NEXT_PUBLIC_BYPASS_AUTH_IN_DEV=true
   ```
3. Restart your development server

## Testing with the Bypass

With the bypass enabled:

1. The middleware will log that it's using the authentication bypass
2. Protected routes like `/profile` should be accessible without authentication in development
3. You can test client-side authentication separately from the middleware

This allows you to determine:
- If the issue is specifically with middleware token verification
- If client-side authentication is working correctly
- If there's a mismatch between how tokens are stored/accessed

## How the Bypass Works

The bypass option modifies the middleware to conditionally skip token verification:

```typescript
// Simplified example of bypass implementation
if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_BYPASS_AUTH_IN_DEV === 'true') {
  console.log('⚠️ WARNING: Using development auth bypass - DO NOT USE IN PRODUCTION ⚠️');
  // Skip token verification in development
  return {
    isValid: true,
    tokens: { dummy: 'token' },
    debugInfo: { bypassEnabled: true }
  };
}
```

## Important Security Warning

⚠️ **NEVER ENABLE THIS BYPASS IN PRODUCTION** ⚠️

This bypass is strictly for development testing and debugging. It completely disables security checks and should never be used in a production environment.

## Recommended Use

1. Enable the bypass to confirm the issue is with token verification
2. Test the client-side authentication flows
3. Use the detailed logs to understand the token verification process
4. Disable the bypass after testing
5. Implement the proper fix based on your findings

## After Testing

Once you've confirmed whether the middleware token verification is the issue:

1. Remove the `NEXT_PUBLIC_BYPASS_AUTH_IN_DEV=true` line from your `.env.local` file
2. Restart your development server
3. Implement the appropriate fix based on your findings
