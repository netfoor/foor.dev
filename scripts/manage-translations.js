#!/usr/bin/env node

/**
 * Script to manage and synchronize translation files.
 * - Removes extra keys from translations.
 * - Adds missing keys from the base language (en).
 *
 * Usage: node scripts/manage-translations.js [--fix]
 */

const fs = require('fs');
const path = require('path');
const { loadTranslation, getAllKeys } = require('./validate-translations');

// Configuration
const TRANSLATIONS_DIR = path.join(__dirname, '../src/translations');
const SUPPORTED_LOCALES = ['en', 'es', 'ja'];
const NAMESPACES = ['common', 'auth', 'homepage', 'profile', 'admin'];
const BASE_LOCALE = 'en';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get a nested value from an object using a dot-separated path.
 */
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((o, k) => (o && o[k] !== 'undefined' ? o[k] : undefined), obj);
}

/**
 * Set a nested value in an object using a dot-separated path.
 */
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] === 'undefined' || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * Delete a nested value in an object using a dot-separated path.
 */
function deleteNestedValue(obj, keyPath) {
    const keys = keyPath.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof current[key] === 'undefined') {
            return;
        }
        current = current[key];
    }
    delete current[keys[keys.length - 1]];
}


/**
 * Save a translation file.
 */
function saveTranslation(locale, namespace, data) {
  const filePath = path.join(TRANSLATIONS_DIR, locale, `${namespace}.json`);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Synchronize translations for a given namespace.
 */
function syncNamespace(namespace, fix = false) {
  log('blue', `\n🔄 Synchronizing namespace: ${namespace}`);

  const baseTranslation = loadTranslation(BASE_LOCALE, namespace);
  if (!baseTranslation) {
    log('red', `  ❌ Base translation (${BASE_LOCALE}/${namespace}) not found. Skipping.`);
    return;
  }

  const baseKeys = new Set(getAllKeys(baseTranslation));

  for (const locale of SUPPORTED_LOCALES) {
    if (locale === BASE_LOCALE) continue;

    const targetTranslation = loadTranslation(locale, namespace);
    if (!targetTranslation) {
      log('yellow', `  ⚠️  Translation for ${locale}/${namespace} not found. Skipping.`);
      continue;
    }

    const targetKeys = new Set(getAllKeys(targetTranslation));

    // Find missing and extra keys
    const missingKeys = [...baseKeys].filter(k => !targetKeys.has(k));
    const extraKeys = [...targetKeys].filter(k => !baseKeys.has(k));

    if (missingKeys.length === 0 && extraKeys.length === 0) {
      log('green', `  ✅ ${locale}: Already in sync.`);
      continue;
    }

    log('yellow', `  ⚠️  ${locale}: Found issues.`);
    if (missingKeys.length > 0) {
      log('yellow', `    - Missing keys: ${missingKeys.length}`);
    }
    if (extraKeys.length > 0) {
      log('yellow', `    - Extra keys: ${extraKeys.length}`);
    }

    if (fix) {
      let changed = false;
      // Add missing keys
      for (const key of missingKeys) {
        const value = getNestedValue(baseTranslation, key);
        setNestedValue(targetTranslation, key, value);
        changed = true;
      }

      // Remove extra keys
      for (const key of extraKeys) {
        deleteNestedValue(targetTranslation, key);
        changed = true;
      }

      if (changed) {
        saveTranslation(locale, namespace, targetTranslation);
        log('green', `  🔧 ${locale}: Fixed! Missing keys added, extra keys removed.`);
      }
    }
  }
}

/**
 * Main function.
 */
function main() {
  log('magenta', '🌍 Translation Synchronization Tool\n');
  const fix = process.argv.includes('--fix');

  if (fix) {
    log('yellow', 'Running in --fix mode. Changes will be saved.\n');
  } else {
    log('blue', 'Running in dry-run mode. No changes will be saved.');
    log('blue', 'Use --fix to apply changes.\n');
  }

  for (const namespace of NAMESPACES) {
    syncNamespace(namespace, fix);
  }

  log('magenta', '\n✨ Synchronization check complete.');
  if (fix) {
    log('green', 'Run `node scripts/validate-translations.js` to see the results.');
  }
}

if (require.main === module) {
  main();
}
