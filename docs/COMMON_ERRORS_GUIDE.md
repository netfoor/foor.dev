# Common Errors and Solutions Guide

This document contains common errors encountered during development and their proven solutions.

## React/Next.js Errors

### 1. useTheme Hook Error

**Error:**
```
Error: useTheme must be used within a ThemeProvider
```

**Problem:**
The `useTheme` hook was throwing an error when components were rendered outside of the ThemeProvider context, particularly during SSR/hydration.

**Solution:**
Modified the `useTheme` hook in `src/hooks/useTheme.ts` to return default values instead of throwing an error:

```typescript
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default values instead of throwing error
    return {
      mode: 'light',
      setMode: () => {},
      toggleMode: () => {},
      isSystemMode: false,
      setSystemMode: () => {},
      systemPreference: 'light'
    };
  }
  return context;
};
```

**Files affected:**
- `src/hooks/useTheme.ts`
- `src/components/ui/Hero.tsx`
- `src/components/theme/ThemeToggle.tsx`
- `src/components/navigation/NavBar.tsx`

---

### 2. React Style Property Conflict

**Error:**
```
Updating a style property during rerender (background) when a conflicting property is set (backgroundClip) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.
```

**Problem:**
React warning when mixing shorthand CSS properties (`background`) with specific properties (`backgroundClip`, `WebkitBackgroundClip`).

**Solution:**
Replace the shorthand `background` property with `backgroundImage`:

**Before:**
```tsx
style={{
  background: 'linear-gradient(135deg, #93C5FD, #60A5FA)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text'
}}
```

**After:**
```tsx
style={{
  backgroundImage: 'linear-gradient(135deg, #93C5FD, #60A5FA)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text'
}}
```

**Files affected:**
- `src/components/ui/Hero.tsx`
- `src/components/navigation/NavBar.tsx` (logo styling)

---

### 3. HTML Button Nesting Error

**Error:**
```
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.
```

**Problem:**
Nested button elements when placing interactive components (like language selector) inside button containers.

**Solution:**
Restructure components to avoid button nesting by separating interactive elements:

**Before:**
```tsx
<button>
  <LanguageSelector /> {/* This creates nested buttons */}
  <Menu />
</button>
```

**After:**
```tsx
<LanguageSelector />
<button>
  <Menu />
</button>
```

**Files affected:**
- `src/components/navigation/NavBar.tsx`
- `src/components/ui/LanguageSelector.tsx`

---

## SEO and Content Management

### 4. SEO Content Consistency

**Issue:**
Inconsistent branding and positioning across different files - mixing "Cloud Engineer" with other messaging.

**Solution:**
Standardized all SEO content, meta tags, and Schema.org markup to focus on **AWS Cloud Engineer** positioning:

**Updated Files:**
- `src/app/[locale]/page.tsx` - Main page SEO metadata
- `src/app/layout.tsx` - Root layout metadata
- `src/translations/en/homepage.json` - English content
- `src/translations/es/homepage.json` - Spanish content  
- `src/translations/ja/homepage.json` - Japanese content
- `README.md` - Project documentation
- `package.json` - Project description and keywords

**Key Changes:**
```typescript
// Before
title: "Generic Developer"
description: "Generic web development services..."

// After  
title: "AWS Cloud Engineer | DevOps & Serverless Solutions"
description: "Expert AWS Cloud Engineer specializing in serverless architecture..."
```

**SEO Keywords Updated:**
- Primary: AWS Cloud Engineer, Serverless Architecture, DevOps, Cloud Infrastructure
- Secondary: AWS Lambda, Infrastructure as Code, Cloud Migration, AWS Solutions

---

## Best Practices

### Theme Usage
- Always use `useTheme` hook for consistent theme handling
- The hook now gracefully handles cases where ThemeProvider is not available
- Use conditional styling based on `mode` for theme-aware components

### CSS Properties
- Avoid mixing shorthand and specific CSS properties
- Use `backgroundImage` instead of `background` when using `backgroundClip`
- Prefer specific properties for better React reconciliation

### Component Structure
- Avoid nesting interactive elements (buttons, links, form controls)
- Structure components to maintain semantic HTML
- Use proper ARIA labels for accessibility

### SEO Consistency
- Maintain consistent messaging across all files
- Use specific, niche keywords rather than broad terms
- Update all related files when changing positioning (metadata, translations, documentation)
- Implement Schema.org markup for better search engine understanding

---

## Error Prevention

1. **Use TypeScript**: Helps catch type-related errors early
2. **ESLint Rules**: Configure rules to catch common React patterns
3. **Testing**: Write tests for components to catch errors before production
4. **Code Review**: Review changes that involve theme usage or interactive elements
5. **SEO Audits**: Regular content audits to ensure consistent messaging
6. **Translation Validation**: Use scripts to validate translation file integrity

---

## Additional Resources

- [React Styling Best Practices](https://react.dev/learn/adding-interactivity)
- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [AWS Amplify UI Theme Documentation](https://ui.docs.amplify.aws/react/theming)
- [Schema.org Documentation](https://schema.org/)
- [SEO Best Practices for Tech Professionals](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

---

## File Input Causing Form Reset Issue

### Problem
When using file inputs inside forms with `<label>` elements, clicking on the label to select files was causing the entire form to reset unexpectedly. This was particularly problematic in admin project forms where users would lose all their entered data when trying to upload images.

### Symptoms
- User enters text in form fields (e.g., "Hola" in title field)
- User clicks on file upload area
- File selection dialog opens
- User selects a file and clicks "Accept"
- Form resets completely, losing all entered data
- Form submission may be triggered unexpectedly

### Root Cause
The issue was caused by using `<label>` elements inside forms. In some browsers, clicking on labels can trigger form submission behavior, especially when the label is associated with an input element inside a form.

### Solution
**Replace `<label>` elements with `<div>` elements and use programmatic click handling:**

```tsx
// ❌ BEFORE (causes form reset)
<label
  onClick={(e) => e.stopPropagation()}
  style={{ cursor: 'pointer' }}
>
  <input
    type="file"
    onChange={handleFileSelect}
    style={{ display: 'none' }}
  />
  Click to upload
</label>

// ✅ AFTER (fixed)
<div
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('file-input')?.click();
  }}
  style={{ cursor: 'pointer' }}
>
  <input
    id="file-input"
    type="file"
    onChange={handleFileSelect}
    style={{ display: 'none' }}
  />
  Click to upload
</div>
```

**Also ensure file change handlers prevent form submission:**
```tsx
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.preventDefault();
  event.stopPropagation();
  
  const file = event.target.files?.[0];
  if (file) {
    // Process file...
  }
  
  // Clear input to allow selecting same file again
  event.target.value = '';
};
```

### Files Fixed
- `src/app/[locale]/admin/projects/new/CreateProjectClient.tsx`
- `src/app/[locale]/admin/projects/[id]/EditProjectClient.tsx`

### Prevention
- Always use `<div>` elements instead of `<label>` for custom file upload areas
- Use programmatic click handling with `document.getElementById()?.click()`
- Always include `event.preventDefault()` and `event.stopPropagation()` in both click and change handlers
- Add unique IDs to file inputs for proper targeting
- Test file upload behavior thoroughly in forms
