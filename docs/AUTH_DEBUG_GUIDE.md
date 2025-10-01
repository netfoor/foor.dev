# Authentication Debug Guide for Middleware

This file explains how to enable and use the enhanced debugging capabilities for the middleware authentication system.

## Understanding the Problem

The logs from your application show that token verification is failing in the middleware with:

```
Middleware: Verificando acceso a /es/profile { isValid: false, hasTokens: false, normalizedPath: '/profile' }
```

This indicates that the `verifyTokens()` function in the middleware is not finding valid authentication tokens, despite the user being seemingly authenticated.

## Debugging Steps

1. **Enable Enhanced Debug Logging**
   
   We've added detailed debug logging to the `verifyTokens()` function to trace exactly where token verification is failing:

   ```typescript
   // In src/lib/amplify/auth.ts
   export async function verifyTokens(enableDebug = false): Promise<{
     isValid: boolean;
     tokens?: any;
     error?: Error;
     debugInfo?: any;
   }>
   ```

   - Set `enableDebug` to `true` to get detailed information about the verification process
   - Look for the logs in your terminal/console to see the step-by-step verification process

2. **Check Token Storage Locations**

   Tokens might be stored in different places:
   
   - Browser localStorage
   - HTTP cookies
   - IndexedDB (used by some versions of Amplify)
   
   You can check the browser's Application tab in Developer Tools to see if tokens exist in these locations.

3. **Add the Debug Flag to Middleware**

   We've updated the middleware to use the debug flag:

   ```typescript
   // In middleware.ts
   const { isValid, tokens, debugInfo } = await verifyTokens(true); // Enable debug mode
   console.log('Token verification debug info:', debugInfo);
   ```

4. **Examine Authentication Flow Timing**

   There might be timing issues where:
   
   - The user appears authenticated in the UI
   - But the middleware runs before authentication is fully established
   - Or token refresh happens right after middleware verification

## Testing with Debug Mode

1. Clear all browser storage (localStorage, cookies, etc.)
2. Restart your development server
3. Log in to your application
4. Check the server console for detailed token verification logs
5. Access `/es/profile` directly and observe the detailed verification logs

## Common Failure Points

1. **Missing Tokens**: Amplify isn't saving tokens where the middleware can find them
2. **Token Refresh Failures**: Refresh tokens might be invalid or expired
3. **Environment Differences**: Development vs production token handling differences
4. **Cookie Settings**: SameSite, Secure, or HttpOnly settings preventing proper access

## Solution Implementation

Once you identify the exact failure point using the debug logs, you can implement the appropriate solution from the TOKEN_VERIFICATION_GUIDE.md document.
