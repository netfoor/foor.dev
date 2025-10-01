# Profile Page Troubleshooting Guide

This document summarizes the issues encountered with the profile page and their solutions.

## Issue 1: LanguageSelector Import Error

### Problem
When visiting http://localhost:3000/es/profile, the following error occurred:

```
Module not found: Can't resolve './Component'
Error: Named export 'LanguageSelector' not found. The requested module '@/components/ui/LanguageSelector' is a CommonJS module, which may not support all module.exports as named exports.
```

### Cause
The error occurred because there was a mismatch between how the `LanguageSelector` component was exported (as a default export) and how it was being imported (as a named export).

### Solution
Changed the import statement in `src/app/[locale]/profile/ProfilePageClient.tsx` from:
```tsx
import { LanguageSelector } from '@/components/ui/LanguageSelector';
```
to:
```tsx
import LanguageSelector from '@/components/ui/LanguageSelector';
```

## Issue 2: Props Mismatch for LanguageSelector

### Problem
After fixing the import issue, TypeScript errors occurred because the props being passed to the `LanguageSelector` component didn't match the component's defined props.

### Cause
The `LanguageSelector` component only accepts:
```tsx
export interface LanguageSelectorProps {
  className?: string;
  mode?: 'light' | 'dark';
  compact?: boolean;
}
```

But it was being used with:
```tsx
<LanguageSelector 
  variant="dropdown" 
  size="md"
  showNativeNames={true}
  showFlags={true}
/>
```

### Solution
Updated the usage to only pass valid props:
```tsx
<LanguageSelector 
  mode={mode as 'light' | 'dark'}
/>
```

## Issue 3: Incomplete Japanese Translations

### Problem
The Japanese translation file for the profile page was incomplete compared to the English and Spanish versions.

### Cause
The `src/translations/ja/profile.json` file only had a few basic keys, missing many keys that are used in the profile page.

### Solution
Updated the Japanese translation file to include all the necessary keys that are used in the profile page, matching the structure of the English and Spanish translation files.

## Additional TypeScript Errors

There are still some TypeScript errors in the `ProfilePageClient.tsx` file related to AWS Amplify UI components, particularly with the `TextField` and `TextAreaField` components. These components require a `label` prop which is currently missing in the implementation.

## Next Steps

1. Fix the remaining TypeScript errors in `ProfilePageClient.tsx` by adding the required `label` props to the form fields.
2. Ensure that all text in the profile page is properly internationalized.
3. Test the profile page in all supported languages (English, Spanish, Japanese) to ensure everything is working correctly.
4. Consider refactoring the `LanguageSelector` component to support additional props that might be useful, such as `variant`, `size`, `showNativeNames`, and `showFlags`.

## See Also

- [Import/Export Guide](./IMPORT_EXPORT_GUIDE.md) - Details on best practices for imports and exports in React components
- [Internationalization Guide](./INTERNATIONALIZATION_GUIDE.md) - Guide on how to use the i18n system in the application
