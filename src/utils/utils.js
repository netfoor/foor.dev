'use strict';

/**
 * Extracts override props for a specific component from the overrides object
 * @param {Object} overrides - Object containing all overrides
 * @param {string} componentName - Name of the component to get overrides for
 * @returns {Object} Component-specific overrides or empty object
 */
export function getOverrideProps(overrides = {}, componentName) {
  return (overrides && overrides[componentName]) || {};
}

/**
 * Gets overrides based on component variants
 * @param {Object} variants - The variants configuration
 * @param {string} variantValues - The specific variant values to use
 * @returns {Object} Variant-specific overrides
 */
export function getOverridesFromVariants(variants, variantValues) {
  const result = {};
  
  if (!variants || !variantValues) {
    return result;
  }

  Object.entries(variants).forEach(([variant, overrides]) => {
    if (variantValues[variant] === true || variantValues[variant] === variant) {
      Object.assign(result, overrides);
    }
  });
  
  return result;
}

/**
 * Merges variant overrides with explicit overrides, with explicit overrides taking precedence
 * @param {Object} variants - Variant configurations
 * @param {Object} overrides - Explicit overrides
 * @returns {Object} Combined overrides
 */
export function mergeVariantsAndOverrides(variants = {}, overrides = {}) {
  const mergedVariants = getOverridesFromVariants(variants, overrides);
  const mergedOverrides = {};
  
  Object.entries(mergedVariants).forEach(([key, value]) => {
    mergedOverrides[key] = { ...value };
  });
  
  Object.entries(overrides).forEach(([key, value]) => {
    if (mergedOverrides[key]) {
      mergedOverrides[key] = { ...mergedOverrides[key], ...value };
    } else {
      mergedOverrides[key] = { ...value };
    }
  });
  
  return mergedOverrides;
}

/**
 * Determines if the current environment is a browser
 * @returns {boolean} Whether code is running in a browser
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}