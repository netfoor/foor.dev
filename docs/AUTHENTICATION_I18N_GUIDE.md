# Authentication Internationalization Guide

This guide explains how to properly implement internationalization (i18n) for authentication components in our application.

## General Principles

1. **All user-facing text should use translation keys** - Never hardcode strings in components.
2. **Use the correct namespace** - Most authentication strings should use the 'auth' namespace.
3. **Use nested keys for related groups** - For example, login.features.aws for login-related features.
4. **Ensure all locales have the same keys** - When adding a new key to one locale, add it to all others.
5. **Use descriptive key names** - Keys should be self-explanatory, like 'login.title' or 'errors.invalid_credentials'.

## Implementation

### 1. Import the translation hook

```tsx
import { useTranslation } from '@/lib/i18n/client';
```

### 2. Initialize the hook with the correct namespace

```tsx
const { t } = useTranslation('auth');
```

### 3. Use the translation keys

```tsx
// Simple usage
<button>{t('logout')}</button>

// With default value
<button>{t('cancel', { defaultValue: 'Cancel' })}</button>

// With nested keys
<h1>{t('login.title')}</h1>

// With parameters
<p>{t('validation.min_password_length', { count: 8 })}</p>
```

## Common Authentication Translation Keys

The following key structure is used for authentication components:

- **Top-level actions**: `login`, `logout`, `register`, `sign_in`, etc.
- **Form fields**: `email`, `password`, `username`, etc.
- **Login section**: `login.title`, `login.subtitle`, `login.features.*`, etc.
- **Errors**: `errors.invalid_credentials`, `errors.user_not_found`, etc.
- **Success messages**: `success.logged_in`, `success.account_created`, etc.
- **Validation**: `validation.email_required`, `validation.password_required`, etc.
- **Placeholders**: `placeholders.enter_email`, `placeholders.enter_password`, etc.

## Components Updated

We've updated the following components to use proper internationalization:

1. **LoginButton.tsx** - Now uses `t('loginWithAWS')` and `t('loading_state')` for button text.
2. **LogoutButton.tsx** - Now uses `t('logout')` and `t('loading_state')` for button text.
3. **AuthGuard.tsx** - Now uses `t('redirecting_to_login')` for the redirect message.
4. **UserProfile.tsx** - Now uses `t('default_username')` for the default username.

## Translation Files

All locales (en, es, ja) now contain the same authentication keys, ensuring consistent behavior across languages.

## Testing Authentication Internationalization

To test that authentication components are properly internationalized:

1. Switch between different languages using the language selector.
2. Verify that all text in login, logout, and authentication messages changes to the selected language.
3. Check loading states and error messages to ensure they're also translated.
4. Verify that fallback values work when a translation key might be missing.

## Best Practices

1. **Always check existing keys** before adding new ones to avoid duplication.
2. **Use descriptive comments** in translation files for complex keys.
3. **Test all languages** after making changes to ensure nothing is broken.
4. **Use variables for dynamic content** rather than concatenating strings.
5. **Consider word length differences** between languages when designing UI components.
