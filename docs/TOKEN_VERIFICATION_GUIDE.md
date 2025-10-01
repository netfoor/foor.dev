# Token Verification Troubleshooting Guide

This document provides a detailed analysis and solutions for the token verification issues in the middleware that prevent access to protected routes like the profile page.

## Observed Issue

The server logs show that the middleware token verification is consistently failing:

```
Middleware: Verificando acceso a /es/profile { isValid: false, hasTokens: false, normalizedPath: '/profile' }
Middleware: Redirigiendo a login, returnUrl=%2Fes%2Fprofile
```

Despite being authenticated in the UI, the middleware can't validate the authentication tokens (`hasTokens: false`).

## Root Causes and Solutions

### 1. Token Storage Mismatch

**Issue**: Amplify Auth might be storing tokens in a location that the middleware can't access.

**Solution**:
- Ensure that tokens are stored in HTTP-only cookies rather than localStorage
- Configure Amplify to use consistent token storage across client and server:

```javascript
// In your Amplify configuration
const amplifyConfig = {
  Auth: {
    // Other auth config...
    cookieStorage: {
      domain: 'localhost',
      path: '/',
      expires: 365,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict"
    }
  }
};
```

### 2. Token Refresh Logic

**Issue**: The middleware's `verifyTokens()` function might be failing to properly refresh tokens.

**Solution**:
- Update the token refresh logic to handle edge cases better:
- Ensure that refresh token errors are properly caught and handled
- Add more detailed logging to pinpoint exactly where token verification is failing

### 3. Environment Differences

**Issue**: In development environments, token verification behaves differently than in production.

**Solution**:
- Add development-specific token handling logic
- Use a more permissive token validation approach in development
- Add additional debug logging for development environments

### 4. Cross-Origin Issues

**Issue**: If your application is using multiple domains or ports (e.g., API on a different origin), cookie sharing might be a problem.

**Solution**:
- Configure proper CORS settings
- Ensure cookie domains are set correctly
- Use proper sameSite cookie attributes

## Implementation Plan

1. **Add Debug Mode to Token Verification**:
   - Enhance the `verifyTokens()` function with more detailed logging
   - Add a debug mode parameter to trace the verification steps

2. **Update Cookie Storage Configuration**:
   - Ensure Amplify is configured to use HTTP-only cookies
   - Make cookie settings consistent across environments

3. **Implement Development Bypass (Temporary)**:
   - Add a development-only bypass option for token verification
   - This will help isolate if the issue is environment-specific

4. **Centralize Authentication Logic**:
   - Ensure client and server authentication use the same mechanisms
   - Remove any duplicate authentication logic

## Testing the Fix

After implementing these changes:

1. Clear all browser storage:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Clear cookies by setting expiration in the past
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

2. Sign out and sign back in completely

3. Check the developer console for detailed token verification logs

4. Try accessing the profile page directly

5. Monitor the server logs to see if token verification succeeds
