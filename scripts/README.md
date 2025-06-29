# Scripts Directory

This directory contains development and utility scripts for the project.

## Development Scripts

### ⚠️ Sample Data Scripts - DO NOT USE IN PRODUCTION

- `create-sample-projects.ts` - Creates sample project data for development/testing
- `create-sample-certifications.ts` - Creates sample certification data for development/testing

**Important Notes:**
- These scripts are for development and testing purposes only
- They should NEVER be executed in a production environment
- They are not included in package.json scripts to prevent accidental execution
- They require manual execution with tsx
- Consider removing or disabling these scripts before production deployment

### Utility Scripts

- `pre-build-check.js` - Performs pre-build validation
- `validate-translations.js` - Validates translation files

## Usage

To run a development script (only in development environment):

```bash
npx tsx scripts/script-name.ts
```

## Production Deployment

Before deploying to production:

1. Review all scripts in this directory
2. Remove or disable any sample data scripts
3. Ensure only necessary utility scripts remain
4. Verify no scripts are accidentally included in production builds
