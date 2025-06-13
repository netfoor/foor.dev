#!/usr/bin/env node

/**
 * Script de utilidad para validar la integridad de las traducciones
 * Uso: node scripts/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const TRANSLATIONS_DIR = path.join(__dirname, '../src/translations');
const SUPPORTED_LOCALES = ['en', 'es', 'fr'];
const NAMESPACES = ['common', 'auth', 'homepage', 'profile', 'admin'];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Cargar archivo de traducción
 */
function loadTranslation(locale, namespace) {
  const filePath = path.join(TRANSLATIONS_DIR, locale, `${namespace}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log('red', `Error parsing ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Obtener todas las claves de un objeto anidado
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Validar que un archivo de traducción tiene el formato correcto
 */
function validateTranslationFormat(translation, locale, namespace) {
  const errors = [];
  
  if (!translation) {
    errors.push(`Translation file missing for ${locale}/${namespace}`);
    return errors;
  }
  
  // Verificar que es un objeto
  if (typeof translation !== 'object' || Array.isArray(translation)) {
    errors.push(`Translation file for ${locale}/${namespace} should be an object`);
    return errors;
  }
  
  // Verificar interpolación correcta
  const allKeys = getAllKeys(translation);
  for (const key of allKeys) {
    const value = getNestedValue(translation, key);
    if (typeof value === 'string') {
      // Verificar paréntesis de interpolación balanceados
      const openBraces = (value.match(/\{\{/g) || []).length;
      const closeBraces = (value.match(/\}\}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        errors.push(`Unbalanced interpolation braces in ${locale}/${namespace}:${key}: "${value}"`);
      }
      
      // Verificar que las variables de interpolación tienen nombres válidos
      const interpolationVars = value.match(/\{\{(\w+)\}\}/g);
      if (interpolationVars) {
        for (const varMatch of interpolationVars) {
          const varName = varMatch.slice(2, -2);
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
            errors.push(`Invalid interpolation variable name in ${locale}/${namespace}:${key}: "${varName}"`);
          }
        }
      }
    }
  }
  
  return errors;
}

/**
 * Obtener valor anidado de un objeto
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}

/**
 * Comparar dos conjuntos de traducciones para encontrar claves faltantes
 */
function findMissingKeys(baseTranslation, targetTranslation) {
  const baseKeys = getAllKeys(baseTranslation);
  const targetKeys = getAllKeys(targetTranslation);
  
  return baseKeys.filter(key => !targetKeys.includes(key));
}

/**
 * Encontrar claves adicionales (que no están en la base)
 */
function findExtraKeys(baseTranslation, targetTranslation) {
  const baseKeys = getAllKeys(baseTranslation);
  const targetKeys = getAllKeys(targetTranslation);
  
  return targetKeys.filter(key => !baseKeys.includes(key));
}

/**
 * Validar completeness de traducciones
 */
function validateCompleteness() {
  log('blue', '\n🔍 Validating translation completeness...\n');
  
  let hasErrors = false;
  
  for (const namespace of NAMESPACES) {
    log('cyan', `Checking namespace: ${namespace}`);
    
    // Usar inglés como referencia
    const baseTranslation = loadTranslation('en', namespace);
    
    if (!baseTranslation) {
      log('red', `  ❌ Base translation (en/${namespace}) not found`);
      hasErrors = true;
      continue;
    }
    
    const baseKeys = getAllKeys(baseTranslation);
    log('green', `  📊 Base translation has ${baseKeys.length} keys`);
    
    // Verificar otros idiomas
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === 'en') continue;
      
      const translation = loadTranslation(locale, namespace);
      
      if (!translation) {
        log('red', `  ❌ ${locale}/${namespace}.json not found`);
        hasErrors = true;
        continue;
      }
      
      const missingKeys = findMissingKeys(baseTranslation, translation);
      const extraKeys = findExtraKeys(baseTranslation, translation);
      const translationKeys = getAllKeys(translation);
      
      const completeness = ((translationKeys.length - extraKeys.length) / baseKeys.length * 100).toFixed(1);
      
      if (missingKeys.length === 0 && extraKeys.length === 0) {
        log('green', `  ✅ ${locale}: Complete (${completeness}%)`);
      } else {
        log('yellow', `  ⚠️  ${locale}: ${completeness}% complete`);
        
        if (missingKeys.length > 0) {
          log('red', `    Missing keys (${missingKeys.length}): ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`);
          hasErrors = true;
        }
        
        if (extraKeys.length > 0) {
          log('yellow', `    Extra keys (${extraKeys.length}): ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? '...' : ''}`);
        }
      }
    }
    
    console.log();
  }
  
  return hasErrors;
}

/**
 * Validar formato de archivos
 */
function validateFormat() {
  log('blue', '\n🔧 Validating translation format...\n');
  
  let hasErrors = false;
  
  for (const locale of SUPPORTED_LOCALES) {
    log('cyan', `Checking locale: ${locale}`);
    
    for (const namespace of NAMESPACES) {
      const translation = loadTranslation(locale, namespace);
      const errors = validateTranslationFormat(translation, locale, namespace);
      
      if (errors.length === 0) {
        log('green', `  ✅ ${namespace}.json - Valid format`);
      } else {
        log('red', `  ❌ ${namespace}.json - ${errors.length} errors:`);
        errors.forEach(error => log('red', `    - ${error}`));
        hasErrors = true;
      }
    }
    
    console.log();
  }
  
  return hasErrors;
}

/**
 * Generar estadísticas
 */
function generateStats() {
  log('blue', '\n📊 Translation Statistics...\n');
  
  const stats = {};
  let totalKeys = 0;
  
  for (const namespace of NAMESPACES) {
    const baseTranslation = loadTranslation('en', namespace);
    if (!baseTranslation) continue;
    
    const baseKeys = getAllKeys(baseTranslation);
    totalKeys += baseKeys.length;
    
    stats[namespace] = {
      baseKeys: baseKeys.length,
      locales: {}
    };
    
    for (const locale of SUPPORTED_LOCALES) {
      const translation = loadTranslation(locale, namespace);
      if (!translation) {
        stats[namespace].locales[locale] = { keys: 0, completeness: 0 };
        continue;
      }
      
      const translationKeys = getAllKeys(translation);
      const missingKeys = findMissingKeys(baseTranslation, translation);
      const completeness = ((translationKeys.length - missingKeys.length) / baseKeys.length * 100);
      
      stats[namespace].locales[locale] = {
        keys: translationKeys.length,
        completeness: Math.round(completeness)
      };
    }
  }
  
  // Mostrar tabla de estadísticas
  console.log('Namespace'.padEnd(12) + SUPPORTED_LOCALES.map(l => l.toUpperCase().padEnd(8)).join(''));
  console.log('-'.repeat(12 + SUPPORTED_LOCALES.length * 8));
  
  for (const [namespace, data] of Object.entries(stats)) {
    let row = namespace.padEnd(12);
    
    for (const locale of SUPPORTED_LOCALES) {
      const localeData = data.locales[locale];
      const status = localeData.completeness === 100 ? '✅' : 
                    localeData.completeness >= 80 ? '⚠️' : '❌';
      row += `${status}${localeData.completeness}%`.padEnd(8);
    }
    
    console.log(row);
  }
  
  log('green', `\nTotal keys in base language (en): ${totalKeys}`);
}

/**
 * Función principal
 */
function main() {
  log('magenta', '🌍 Translation Validation Tool\n');
  log('magenta', '===============================');
  
  // Verificar que el directorio de traducciones existe
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    log('red', `❌ Translations directory not found: ${TRANSLATIONS_DIR}`);
    process.exit(1);
  }
  
  let hasErrors = false;
  
  // Validar formato
  if (validateFormat()) {
    hasErrors = true;
  }
  
  // Validar completeness
  if (validateCompleteness()) {
    hasErrors = true;
  }
  
  // Generar estadísticas
  generateStats();
  
  // Resultado final
  if (hasErrors) {
    log('red', '\n❌ Validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    log('green', '\n✅ All validations passed! Your translations are ready to go.');
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  validateCompleteness,
  validateFormat,
  generateStats,
  loadTranslation,
  getAllKeys
};
