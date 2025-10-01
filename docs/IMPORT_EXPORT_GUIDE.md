# Import and Export Issues in React Components

This guide documents an issue encountered with importing/exporting components in our Next.js application and explains the fix.

## Issue: Named Import vs Default Export

We encountered an error in the profile page where the `LanguageSelector` component failed to load with the error message:

```
Module not found: Can't resolve './Component'
Error: Named export 'LanguageSelector' not found. The requested module '@/components/ui/LanguageSelector' is a CommonJS module, which may not support all module.exports as named exports.
```

### Root Cause

The issue stemmed from a mismatch between how the component was exported and how it was being imported:

1. In `src/components/ui/LanguageSelector.tsx`, the component was exported using a default export:
   ```tsx
   export default LanguageSelector;
   ```

2. But in `src/app/[locale]/profile/ProfilePageClient.tsx`, it was being imported as a named export:
   ```tsx
   import { LanguageSelector } from '@/components/ui/LanguageSelector';
   ```

### Solution

We fixed this by changing the import in `ProfilePageClient.tsx` to match the export type:

```tsx
import LanguageSelector from '@/components/ui/LanguageSelector';
```

### Props Mismatch

Additionally, there was a mismatch between the props defined in the `LanguageSelector` component and the props being passed in the `ProfilePageClient.tsx`:

- The `LanguageSelector` component accepts:
  ```tsx
  export interface LanguageSelectorProps {
    className?: string;
    mode?: 'light' | 'dark';
    compact?: boolean;
  }
  ```

- But it was being used with different props:
  ```tsx
  <LanguageSelector 
    variant="dropdown" 
    size="md"
    showNativeNames={true}
    showFlags={true}
  />
  ```

We updated the usage to only pass valid props:

```tsx
<LanguageSelector 
  mode={mode as 'light' | 'dark'}
/>
```

## Best Practices for Imports/Exports

To avoid similar issues in the future:

1. **Be consistent with export types**:
   - If using default exports, import without curly braces: `import Name from './component'`
   - If using named exports, import with curly braces: `import { Name } from './component'`

2. **Consider using named exports for most components**:
   - Named exports make it clearer what's being imported
   - They work better with tree-shaking
   - They're less error-prone when refactoring

3. **Document component props with TypeScript interfaces**:
   - Always check the props interface before using a component
   - VS Code tooltips can help identify the correct props

4. **Use consistent export patterns across your codebase**:
   - Either use default exports for all components or named exports for all components
   - Mixing styles can lead to confusion

By following these guidelines, we can prevent similar issues in the future and maintain a more maintainable codebase.
