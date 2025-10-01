# Authentication Redirection Loop Guide

## Problem Description

A redirection loop can occur in applications with role-based authentication when there's a mismatch between authentication and authorization checks in different parts of the application. This typically manifests as an infinite redirection cycle between two pages.

### Symptoms

- Browser oscillates between two URLs (e.g., `/login?returnUrl=%2Fadmin` and `/admin`)
- Network tab shows alternating redirections between pages
- Browser may eventually show an error about "Too many redirects"
- User is stuck and unable to view content or navigate normally

### Specific Issue in Our Application

In our Next.js application with AWS Amplify authentication:

1. **Scenario**: A user authenticates successfully through Cognito but lacks the required role permissions (e.g., 'admin')
2. **Redirect Loop Process**:
   - User logs in via Cognito and is authenticated
   - Login page sees `isAuthenticated = true` and redirects to the admin page
   - Admin page's AuthGuard checks `isAuthenticated && hasRole('admin')` 
   - Since `hasRole('admin') = false`, redirects back to login with a returnUrl
   - Login page again sees `isAuthenticated = true` and redirects to admin
   - This cycle continues indefinitely

## Root Cause Analysis

The core issue is the mismatch between two different checks:

1. **Login Page Logic**: Only checked `isAuthenticated` status before redirecting to protected routes
   ```tsx
   if (isAuthenticated && !isLoading) {
     router.push(returnUrl); // Redirects regardless of role
   }
   ```

2. **AuthGuard Component**: Checked both authentication AND role permissions
   ```tsx
   if (!isLoading && (!isAuthenticated || !hasRole(role))) {
     setShouldRedirect(true); // Redirects to login if role check fails
   }
   ```

This creates a "ping-pong" effect where the user is continuously sent back and forth between pages.

## Solution

### Implementation Fix

The solution involves making the login page aware of role requirements before redirecting:

```tsx
if (isAuthenticated && !isLoading) {
  // Check if the returnUrl is for admin page
  if (returnUrl && returnUrl.includes('/admin')) {
    // For admin pages, only redirect if admin role is confirmed
    if (hasRole('admin')) {
      router.push(returnUrl);
    } else {
      router.push(`/${locale}/access-denied`);
    }
  } else {
    // For non-admin pages, redirect as usual
    router.push(returnUrl);
  }
}
```

### Key Improvements

1. **Path Analysis**: Examine the return URL to identify if it's a role-protected route
2. **Role Verification**: Check for the specific role required by the destination
3. **Graceful Fallback**: Redirect to an "access denied" page rather than continuing the loop
4. **User Experience**: User receives clear feedback about permission issues

## Testing the Solution

To verify this fix is working correctly:

1. Log in with a user account that does not have admin permissions
2. Confirm you are redirected to the access-denied page, not stuck in a loop
3. Navigate to the home page and manually try to access `/admin`
4. Verify you are again redirected to the access-denied page

## Prevention Strategies

To prevent similar issues in the future:

1. **Consistent Permission Checks**: Ensure login redirections and route guards use the same permission verification logic
2. **Clear Fallback Paths**: Always define where users should go when they lack permissions
3. **Role-Based Routing**: Consider implementing a centralized router that handles role-based navigation
4. **Authentication State Management**: Maintain clear separation between authentication state (is the user logged in?) and authorization state (what can the user do?)

## Additional Considerations

- **Cache Clearing**: If a user's permissions change, ensure caches are invalidated appropriately
- **Token Expiration**: Handle expired tokens gracefully, avoiding potential redirection issues
- **Session Management**: Consistently check session state across the application
- **Error Logging**: Log authentication and authorization failures to help diagnose similar issues

By implementing these practices, you can avoid authentication redirection loops and provide a better user experience when handling authentication and authorization.
