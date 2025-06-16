# Configuring AWS Amplify Authentication for Next.js Middleware

This guide explains how to properly configure AWS Amplify authentication to work with Next.js middleware for protected routes.

## The Challenge

Next.js middleware runs in a server context and needs to verify authentication tokens, but by default, Amplify stores tokens in locations that middleware can't access (like localStorage).

## Solution: Cookie-Based Token Storage

The key to making Amplify authentication work with Next.js middleware is to configure Amplify to store tokens in HTTP cookies that the middleware can access.

### Configuration Steps

1. **Update Amplify Configuration**

We've modified the Amplify configuration in `src/app/lib/config.ts` to use HTTP cookies for token storage:

```typescript
const config = {
  ...amplifyOutputs,
  Auth: {
    Cognito: {
      ...amplifyOutputs.auth,
      // Enhanced cookie configuration for middleware compatibility
      cookieStorage: {
        domain: window.location.hostname,
        path: '/',
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      },
      // Set to use cookies for token storage
      tokenCookieStorage: {
        domain: window.location.hostname,
        path: '/',
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,  // Allows server access but not client JS
        sameSite: 'strict'
      }
    }
  }
};
```

2. **Understanding the Cookie Configuration**

- `cookieStorage`: General cookie settings
- `tokenCookieStorage`: Specific settings for auth tokens
- `httpOnly: true`: Critical setting that makes cookies accessible to the server but not to client JavaScript
- `sameSite: 'strict'`: Security setting to prevent CSRF attacks

3. **Middleware Token Verification**

With this configuration, the middleware can now access the authentication tokens from cookies:

```typescript
// In middleware.ts
const { isValid, tokens } = await verifyTokens();
```

The `verifyTokens()` function can now properly access and validate the tokens stored in cookies.

## How It Works

1. **User Authentication Flow**:
   - User logs in via Amplify auth
   - Tokens are stored in HTTP-only cookies
   - These cookies are automatically sent with each request

2. **Middleware Verification**:
   - When a request is made to a protected route
   - Middleware receives the cookies with the request
   - `verifyTokens()` extracts and validates the tokens
   - User is allowed access or redirected based on token validity

## Troubleshooting

If you're still experiencing issues:

1. **Clear all browser storage**:
   - Sign out completely
   - Clear cookies, localStorage, and sessionStorage
   - Restart the browser

2. **Check cookie settings**:
   - Ensure domain matches your development environment
   - For local development, use `.localhost` or specific IP
   - Review Chrome DevTools > Application > Cookies

3. **Enable debug mode**:
   - Set `NEXT_PUBLIC_DEBUG_AUTH=true` in `.env.local`
   - Check server logs for detailed verification steps

4. **Development bypass**:
   - Temporarily set `NEXT_PUBLIC_BYPASS_AUTH_IN_DEV=true` in `.env.local`
   - This confirms if middleware verification is the issue

## Security Considerations

This approach uses HTTP-only cookies for token storage, which provides several security benefits:

1. **XSS Protection**: JavaScript cannot access HTTP-only cookies, protecting against cross-site scripting attacks
2. **CSRF Protection**: The `sameSite: 'strict'` setting helps prevent cross-site request forgery
3. **Transport Security**: In production, the `secure: true` setting ensures cookies are only sent over HTTPS

Remember to enable the `secure` flag in production environments to ensure tokens are only transmitted over secure connections.
