# Foor.dev - AWS Cloud Engineer Portfolio

A modern, SEO-optimized portfolio website for AWS Cloud Engineer services, built with Next.js, AWS Amplify, and TypeScript.

## 🚀 About

Professional portfolio showcasing AWS Cloud Engineering services, specializing in:

- **Serverless Architecture** - AWS Lambda, API Gateway, DynamoDB
- **DevOps Automation** - CI/CD pipelines, Infrastructure as Code
- **Cloud Infrastructure** - AWS architecture design and optimization
- **Cloud Migration** - Legacy system modernization and cloud adoption

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Library**: AWS Amplify UI React
- **Styling**: Tailwind CSS + AWS Amplify UI
- **Authentication**: AWS Amplify Auth
- **Internationalization**: next-i18next (English, Spanish, Japanese)
- **Theme**: Dynamic light/dark mode with system preference detection
- **SEO**: Optimized metadata, Schema.org markup, multilingual support

## 🌟 Features

### Core Features
- ✅ **Multilingual SEO** - English, Spanish, Japanese
- ✅ **Dynamic Theming** - Light/dark mode with smooth transitions
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Performance Optimized** - Core Web Vitals optimized
- ✅ **Accessibility** - WCAG compliant components

### AWS Integration
- ✅ **Amplify Auth** - Secure user authentication
- ✅ **Amplify UI** - Consistent design system
- ✅ **Cloud-native** - Built for AWS deployment

### SEO Optimization
- ✅ **Schema.org Markup** - Rich snippets for better search visibility
- ✅ **Meta Tags** - Dynamic, language-specific metadata
- ✅ **Sitemap Generation** - Automated multilingual sitemaps
- ✅ **Canonical URLs** - Proper URL structure for SEO

## 🎯 Target Keywords

### Primary
- AWS Cloud Engineer
- Serverless Architecture
- DevOps Automation
- Cloud Infrastructure

### Secondary
- AWS Lambda
- Infrastructure as Code
- Cloud Migration
- AWS Solutions Architect

## 📱 Pages & Components

### Pages
- **Home** (`/`) - Hero section with professional introduction
- **About** (`/about`) - Detailed background and expertise
- **Services** (`/services`) - AWS cloud engineering services
- **Portfolio** (`/portfolio`) - Case studies and projects
- **Contact** (`/contact`) - Get in touch form

### Key Components
- **Hero** - SEO-optimized introduction with Schema markup
- **NavBar** - Multilingual navigation with theme toggle
- **ThemeToggle** - Dynamic light/dark mode switching
- **LanguageSelector** - Multi-language support
- **HeaderControls** - Combined navigation controls

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AWS Amplify CLI (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/netfoor/foor.dev.git
cd foor.dev

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `.env.local` file:

```env
# AWS Amplify Configuration
NEXT_PUBLIC_AMPLIFY_APP_ID=your_app_id
NEXT_PUBLIC_AMPLIFY_BRANCH=main

# SEO Configuration
NEXT_PUBLIC_BASE_URL=https://foor.dev
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── [locale]/          # Internationalized routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── navigation/        # Navigation components
│   ├── theme/            # Theme-related components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── amplify/          # AWS Amplify configuration
│   └── i18n/             # Internationalization setup
└── translations/         # Language files
    ├── en/               # English translations
    ├── es/               # Spanish translations
    └── ja/               # Japanese translations
```

## 🌍 Internationalization

Supports three languages with full SEO optimization:

- **English** (`en`) - Primary language
- **Spanish** (`es`) - Secondary language  
- **Japanese** (`ja`) - Additional market

### Adding New Languages

1. Add locale to `src/lib/i18n/config.ts`
2. Create translation files in `src/translations/[locale]/`
3. Update SEO metadata in page components

## 🎨 Theming

Dynamic theme system with:

- **Light Mode** - Professional appearance for daytime browsing
- **Dark Mode** - Modern dark theme with optimized colors
- **System Preference** - Automatically detects user's OS preference
- **Smooth Transitions** - Animated theme changes

## 📊 SEO Strategy

### Technical SEO
- Server-side rendering (SSR)
- Dynamic meta tags per language
- Structured data (Schema.org)
- Optimized Core Web Vitals
- Multilingual hreflang tags

### Content SEO
- AWS Cloud Engineer focused keywords
- Technical blog content (planned)
- Case studies and portfolio pieces
- Professional service descriptions

## 🚀 Deployment

### AWS Amplify Deployment

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Deploy
amplify publish
```

### Manual Deployment

```bash
# Build for production
npm run build

# Export static files (if needed)
npm run export
```

## � Common Issues & Solutions

### Cognito Groups Authorization Issue
If you get "Unauthorized" errors when trying to create/edit content as an admin:

**Problem:** `defaultAuthorizationMode` was set to `'identityPool'` instead of `'userPool'`

**Solution:** 
```typescript
// amplify/data/resource.ts
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // Must be 'userPool' for Cognito groups
  },
});
```

See [COGNITO_GROUPS_AUTHORIZATION_SOLUTION.md](./docs/COGNITO_GROUPS_AUTHORIZATION_SOLUTION.md) for complete details.

### Other Solutions
- [Common Errors Guide](./docs/COMMON_ERRORS_GUIDE.md)
- [Amplify Client SSR Solution](./docs/AMPLIFY_CLIENT_ERROR_SOLUTION.md)

## �📈 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Optimized with dynamic imports
- **Image Optimization**: Next.js Image component with lazy loading

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

## 📄 License

© 2024 Fortino Romero Mantilla. All rights reserved.

## 📞 Contact

- **Website**: [foor.dev](https://foor.dev)
- **LinkedIn**: [fortino-romero-mantilla](https://linkedin.com/in/fortino-romero-mantilla)
- **GitHub**: [netfoor](https://github.com/netfoor)
- **Email**: fortino.rom@gmail.com

---

**Specializing in AWS Cloud Solutions | DevOps Automation | Serverless Architecture**
