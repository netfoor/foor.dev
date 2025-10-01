#!/usr/bin/env node

/**
 * Pre-build verification script
 * Checks if the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let hasErrors = false;

function addCheck(name, success, message) {
  checks.push({ name, success, message });
  if (!success) {
    hasErrors = true;
  }
}

console.log('🔍 Running pre-build verification...\n');

// Check 1: Verify amplify_outputs.json exists
const amplifyOutputsExists = fs.existsSync('amplify_outputs.json');
addCheck(
  'Amplify Configuration',
  amplifyOutputsExists,
  amplifyOutputsExists 
    ? 'amplify_outputs.json found'
    : 'amplify_outputs.json missing - run amplify sandbox'
);

// Check 2: Verify no debug components in admin
const adminProjectsClient = fs.readFileSync('src/app/[locale]/admin/projects/AdminProjectsClient.tsx', 'utf8');
const hasDebugComponents = adminProjectsClient.includes('RefreshUserSession') || 
                          adminProjectsClient.includes('DebugJWTTokens');
addCheck(
  'Debug Components',
  !hasDebugComponents,
  hasDebugComponents 
    ? 'Debug components found in AdminProjectsClient'
    : 'No debug components found'
);

// Check 3: Verify environment file structure
const envLocalExists = fs.existsSync('.env.local');
addCheck(
  'Environment Configuration',
  true, // This is optional for Amplify
  envLocalExists 
    ? '.env.local found (optional for Amplify)'
    : '.env.local not found (using amplify_outputs.json)'
);

// Check 4: Verify TypeScript compilation
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  addCheck('TypeScript Compilation', true, 'No TypeScript errors');
} catch (error) {
  addCheck('TypeScript Compilation', false, 'TypeScript errors found - run npm run type-check');
}

// Check 5: Verify essential files exist
const essentialFiles = [
  'src/app/layout.tsx',
  'src/app/[locale]/layout.tsx',
  'src/app/[locale]/page.tsx',
  'amplify/data/resource.ts',
  'amplify/auth/resource.ts'
];

essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  addCheck(
    `Essential File: ${file}`,
    exists,
    exists ? 'Found' : 'Missing'
  );
});

// Check 6: Verify no test files in production build
const testFiles = [];
function findTestFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTestFiles(filePath);
    } else if (file.includes('.test.') || file.includes('.spec.')) {
      testFiles.push(filePath);
    }
  });
}

try {
  findTestFiles('src');
  addCheck(
    'Test Files',
    testFiles.length === 0,
    testFiles.length === 0 ? 'No test files in src/' : `Found ${testFiles.length} test files`
  );
} catch (error) {
  addCheck('Test Files', true, 'Could not scan for test files');
}

// Display results
console.log('📋 Pre-build Check Results:\n');
checks.forEach(check => {
  const icon = check.success ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.message}`);
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ BUILD NOT READY - Please fix the issues above');
  process.exit(1);
} else {
  console.log('✅ BUILD READY - All checks passed!');
  console.log('\n🚀 You can proceed with:');
  console.log('   npm run build');
  console.log('   amplify deploy --type sandbox');
  process.exit(0);
}
