# React Hooks Usage Guide

## Invalid Hook Call Error

When working with React hooks, you might encounter the following error:

```
Error: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

This document explains common causes of this error in our Next.js application with AWS Amplify and how to fix them.

## Problem Description

### Specific Issue in Our Application

In our login flow, we encountered this error when trying to dynamically import and use the `useAuthorization` hook inside a useEffect callback:

```tsx
// This pattern triggered the invalid hook call error
useEffect(() => {
  if (isAuthenticated && !isLoading) {
    if (returnUrl && returnUrl.includes('/admin')) {
      // Dynamic import of a hook - this breaks the Rules of Hooks
      import('@/hooks/useAuthorization').then(({ useAuthorization }) => {
        const { hasRole } = useAuthorization(); // ❌ Invalid hook usage
        if (hasRole('admin')) {
          router.push(returnUrl);
        } else {
          router.push(`/${locale}/access-denied`);
        }
      });
    }
  }
}, [isAuthenticated, isLoading, returnUrl, router, locale]);
```

### Error Stack Trace Analysis

The stack trace for this error typically shows:

```
throwInvalidHookError@http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:6180:15
exports.useContext@http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_2ce9398a._.js:1660:27
useAuth@http://localhost:3000/_next/static/chunks/_bfc71488._.js:525:197
useAuthorization@http://localhost:3000/_next/static/chunks/src_45a9124f._.js:19:191
```

This indicates that the React runtime detected a hook being called in an invalid way, likely violating the Rules of Hooks.

## Understanding the Rules of Hooks

React's [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) are strict guidelines that must be followed:

1. **Only Call Hooks at the Top Level**
   - Don't call hooks inside loops, conditions, or nested functions
   - Hooks must be called in the same order on every render

2. **Only Call Hooks from React Function Components or Custom Hooks**
   - Don't call hooks from regular JavaScript functions
   - Don't call hooks from class components

3. **Hooks Cannot Be Dynamically Imported and Used Immediately**
   - React requires hooks to be statically analyzable
   - Dynamic imports of hooks break React's ability to track hook states

## Root Cause Analysis

In our specific case, we attempted to:

1. Dynamically import the `useAuthorization` hook inside a useEffect callback
2. Call the imported hook immediately within that callback
3. Use the returned value (`hasRole`) for conditional logic

This violated the Rules of Hooks because:
- Hooks must be called at the top level of a component, not inside callbacks
- Dynamic imports make hooks non-statically analyzable for React
- React couldn't properly maintain the hook's state between renders

## Solution

### Implementation Fix

The solution is to import and use the hook at the top level of the component:

```tsx
// Static import at the top of the file
import { useAuthorization } from '@/hooks/useAuthorization';

function LoginContent({ locale, returnUrl }) {
  // Call hooks at the top level of the component
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization(); // ✅ Correct hook usage
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (returnUrl && returnUrl.includes('/admin')) {
        // Now we can use hasRole directly
        if (hasRole('admin')) {
          router.push(returnUrl);
        } else {
          router.push(`/${locale}/access-denied`);
        }
      } else {
        router.push(returnUrl);
      }
    }
  }, [isAuthenticated, isLoading, returnUrl, router, locale, hasRole]); // Include hasRole in dependencies
}
```

### Key Improvements

1. **Static Imports**: Import hooks at the file level, not inside functions or callbacks
2. **Top-Level Hook Calls**: Call all hooks at the beginning of the component function
3. **Proper Dependency Arrays**: Include all hooks' return values in useEffect dependency arrays
4. **Consistent Hook Order**: Ensure hooks are called in the same order on every render

## Testing the Solution

To verify the fix is working:

1. Check the browser console for absence of the "Invalid hook call" error
2. Verify the login flow works correctly with both admin and non-admin users
3. Confirm role-based redirections work as expected
4. Test across different browsers to ensure consistent behavior

## Prevention Strategies

To avoid invalid hook calls in the future:

1. **Use ESLint Plugin**: Implement the [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) which can catch many hook-related issues
   ```json
   {
     "plugins": ["react-hooks"],
     "rules": {
       "react-hooks/rules-of-hooks": "error",
       "react-hooks/exhaustive-deps": "warn"
     }
   }
   ```

2. **Code Review Checklist**:
   - Are hooks imported statically?
   - Are hooks called only at the top level?
   - Are hook dependencies properly declared?
   - Is there any dynamic usage of hooks?

3. **Component Structure Best Practices**:
   - Keep components focused and small
   - Extract complex logic into custom hooks
   - Lift state when needed to avoid prop drilling

4. **Avoid Common Anti-Patterns**:
   - Don't wrap hook calls in conditionals
   - Don't call hooks inside loops
   - Don't use hooks in regular JavaScript functions
   - Don't dynamically import hooks for immediate use

## Additional Resources

- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html)
- [Hooks FAQ](https://reactjs.org/docs/hooks-faq.html)
- [ESLint Plugin for React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

By following these guidelines, you can avoid the "Invalid hook call" error and use React hooks effectively in your Next.js application.
