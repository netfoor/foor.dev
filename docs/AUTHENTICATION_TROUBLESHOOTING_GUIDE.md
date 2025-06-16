# Authentication Troubleshooting Guide

This guide serves as a reference for common authentication and React-related issues you might encounter in the foor.dev application. It provides links to more detailed documentation for specific problems.

## Common Authentication Issues

### 1. Authentication Redirection Loops

**Symptoms:**
- Browser continuously redirects between login and protected pages
- URLs alternate between formats like `/login?returnUrl=%2Fadmin` and `/admin`
- Browser may eventually show a "too many redirects" error

**Solution Overview:**
- Ensure login page checks both authentication status AND required role permissions
- Implement proper fallback paths for users with insufficient permissions
- Redirect to access-denied page rather than continuing redirect loops

**Detailed Documentation:**
- [Authentication Redirection Loop Guide](./AUTHENTICATION_REDIRECTION_LOOP_GUIDE.md)

### 2. React "Invalid Hook Call" Errors

**Symptoms:**
- Console error: "Invalid hook call. Hooks can only be called inside of the body of a function component."
- Application crashes or behaves unexpectedly
- Hook-related functionality fails to work properly

**Solution Overview:**
- Ensure hooks are imported statically at the top of files
- Call hooks only at the top level of React function components
- Never use hooks inside callbacks, conditionals or after dynamic imports

**Detailed Documentation:**
- [React Hooks Usage Guide](./REACT_HOOKS_USAGE_GUIDE.md)

### 3. Authentication vs. Authorization Issues

Authentication (identity verification) and authorization (permission verification) are distinct concepts that work together in our application:

- **Authentication**: Verifies the user's identity (handled by AWS Cognito)
- **Authorization**: Determines what the user can access (handled by role-based checks)

Issues often arise from the incorrect handling of these distinct concepts. See the following guides for related topics:

- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Common Errors Guide](./COMMON_ERRORS_GUIDE.md)

## Best Practices for Authentication Workflows

1. **Clear Separation of Concerns**
   - Keep authentication logic (is the user logged in?) separate from authorization logic (what can the user do?)
   - Use dedicated hooks and contexts for each purpose

2. **Consistent Permission Checks**
   - Use the same permission verification logic across the application
   - Avoid duplicating role-checking code in multiple places

3. **Graceful Fallbacks**
   - Always provide clear paths for unauthorized users
   - Show helpful error messages explaining why access was denied

4. **User Experience**
   - Maintain the user's intended destination through the authentication flow
   - Properly handle return URLs to redirect users to their original destination

5. **Error Logging**
   - Log authentication and authorization failures for debugging
   - Include enough context to understand what went wrong

## When to Use Access Denied vs. Login Pages

- **Login Page**: Redirect here when the user is not authenticated (not logged in at all)
- **Access Denied Page**: Redirect here when the user is authenticated but lacks necessary permissions

## Debugging Authentication Issues

1. **Check Browser Storage**
   - Examine localStorage and sessionStorage for token information
   - Clear storage to test fresh authentication flows

2. **Examine Network Requests**
   - Look for token exchange with Cognito
   - Check for appropriate Authorization headers

3. **Console Logging**
   - Add temporary logs to track the authentication state
   - Monitor state changes during redirects

4. **React DevTools**
   - Inspect component props and state related to authentication
   - Verify context values are being properly provided and consumed

## Additional Resources

- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
- [Next.js Authentication Documentation](https://nextjs.org/docs/authentication)
- [React Context API Documentation](https://reactjs.org/docs/context.html)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)

By referring to these guides and following the outlined best practices, you can avoid common authentication issues and build a more robust and user-friendly authentication system.
