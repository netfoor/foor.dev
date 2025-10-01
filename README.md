# Foor.dev - AWS Cloud Engineer Portfolio

A modern, SEO-optimized portfolio built with Next.js, AWS Amplify (Gen 2), and TypeScript. Includes a secure Admin Panel, multilingual content, and AWS-native integrations.

## 🚀 About

Professional portfolio showcasing AWS Cloud Engineering services, specializing in:

- Serverless Architecture (Lambda, API Gateway, DynamoDB)
- DevOps Automation (CI/CD, IaC)
- Cloud Infrastructure (design, cost, performance)
- Cloud Migration (modernization and adoption)

## 🛠️ Tech Stack

- Framework: Next.js 15 + TypeScript (App Router)
- AWS: Amplify Gen 2 (Auth, Data, Hosting), Cognito User Pools, S3
- UI: AWS Amplify UI React + custom CSS
- Auth: Amplify Auth with Cognito Groups, Next.js middleware guard
- i18n: Custom library in `src/lib/i18n` with server/client helpers and JSON translations (`en`, `es`, `ja`)
- SEO: Dynamic metadata per locale, Schema.org, multi-language routing

## 🌟 Features

### Core
- ✅ Multilingual site (English, Spanish, Japanese)
- ✅ Dynamic theming (light/dark + system)
- ✅ Responsive and accessible UI
- ✅ Strong SEO and metadata per locale

### Admin Panel (secured)
- ✅ CRUD for Projects, Certifications, Education, Recognitions, Skills, Profile
- ✅ File uploads to S3, image gallery support
- ✅ Full deletion flow: DynamoDB + S3 cleanup (see `src/lib/utils/s3-cleanup.ts` and docs)
- ✅ Token verification via middleware and client token sync

### AWS Integrations
- ✅ Amplify Data models with Cognito Groups authorization
- ✅ Middleware-based auth (`src/lib/amplify/middleware-auth.ts`)
- ✅ Image optimization function (`amplify/functions/image-optimitation`)

## 📱 Routes

Localized routes under `/{locale}` (en, es, ja):

- Public
  - `/{locale}` – Home
  - `/{locale}/projects` and `/{locale}/projects/[slug]`
  - `/{locale}/certifications`, `/{locale}/recognitions`, `/{locale}/skills`, `/{locale}/about`
  - `/{locale}/login`
- Admin (requires Cognito Admin group)
  - `/{locale}/admin` dashboard
  - `/{locale}/admin/projects`, `/{locale}/admin/certifications`, `/{locale}/admin/education`, `/{locale}/admin/recognitions`, `/{locale}/admin/skills`, `/{locale}/admin/about/profile`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- An Amplify Gen 2 app connected to this repo (for production)

### Install & Run

```bash
# Clone
git clone https://github.com/netfoor/foor.dev.git
cd foor.dev

# Install deps
npm install

# Dev server
npm run dev
```

### Environment

- Amplify Gen 2 injects config via `amplify_outputs.json` (committed). A `.env.local` is optional.
- Optional vars:
  - `NEXT_PUBLIC_BASE_URL=https://foor.dev`
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=...`

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/                # Localized routes (public + admin)
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
├── components/
│   ├── navigation/              # NavBar and header controls
│   ├── theme/                   # Theme providers and toggles
│   └── ui/                      # UI sections (Home, Projects, etc.)
├── hooks/                       # useTheme, useAuthorization, etc.
├── lib/
│   ├── amplify/                 # Auth, middleware, token sync
│   ├── i18n/                    # i18n server/client/config/types
│   └── utils/                   # S3 cleanup, images, helpers
└── translations/                # en/, es/, ja/ JSON files
```

## 🌍 Internationalization

- Translations live in `src/translations/{en,es,ja}`.
- i18n helpers in `src/lib/i18n/{server,client,config}.ts`.
- Add a language by updating config and adding JSON files.

Utilities:
- `scripts/validate-translations.js` – validates keys across locales
- `scripts/manage-translations.js` and `scripts/translation-diff.js`

## 🎨 Theming

- Theme provider at `src/components/theme/ThemeProviderWrapper.tsx`
- Toggle via `ThemeToggle` or `ThemeSelector`
- CSS helpers in `src/components/theme/theme-sync.css`

## 🧰 Scripts

From `package.json`:

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint the codebase
- `npm run seed` – seed sample data (development only)

Other helpful scripts (run manually):

- `node scripts/pre-build-check.js` – sanity checks before build
- `node scripts/validate-translations.js` – translation validation
- `node scripts/translation-diff.js` – diff translation keys

## 🔐 Admin Access

1. Create a Cognito user in your User Pool.
2. Add the user to the Admin group.
3. Log in via `/{locale}/login` and access `/{locale}/admin`.

## 🖼️ Image & Data Management

- Image optimization function under `amplify/functions/image-optimitation`.
- Project deletion removes related S3 files via `src/lib/utils/s3-cleanup.ts`.
- See docs: [`COMPLETE_PROJECT_DELETION_SYSTEM.md`](./docs/COMPLETE_PROJECT_DELETION_SYSTEM.md)

## 📊 SEO

- Locale-aware metadata and structured data.
- Consistent positioning for “AWS Cloud Engineer”.
- See: [`COMMON_ERRORS_GUIDE.md`](./docs/COMMON_ERRORS_GUIDE.md) for SEO consistency tips.

## 🚢 Deployment (Amplify Gen 2)

- Connect the GitHub repo to Amplify Hosting and set `main` as the default branch.
- Configure your custom domain (e.g., `foor.dev`, `www.foor.dev`).
- Ensure Cognito callback/logout URLs include your domain in `amplify/auth/resource.ts`.
- On push to `main`, Amplify builds and deploys automatically.

Related docs:
- [`AMPLIFY_NEXTJS_MIDDLEWARE_AUTH.md`](./docs/AMPLIFY_NEXTJS_MIDDLEWARE_AUTH.md)
- [`TOKEN_SYNC_SOLUTION.md`](./docs/TOKEN_SYNC_SOLUTION.md)
- [`DOMAIN.md`](./docs/DOMAIN.md)

## 🧩 Troubleshooting

- Common issues: [`COMMON_ERRORS_GUIDE.md`](./docs/COMMON_ERRORS_GUIDE.md)
- Auth errors: [`AUTHENTICATION_TROUBLESHOOTING_GUIDE.md`](./docs/AUTHENTICATION_TROUBLESHOOTING_GUIDE.md)
- Authorization (groups): [`COGNITO_GROUPS_AUTHORIZATION_SOLUTION.md`](./docs/COGNITO_GROUPS_AUTHORIZATION_SOLUTION.md)

## 📈 Performance

- Core Web Vitals optimized; production build recommendations in [`PRODUCTION_OPTIMIZATION.md`](./docs/PRODUCTION_OPTIMIZATION.md)

## 🤝 Contributing

Personal portfolio – suggestions and feedback welcome.

## 📄 License

© 2024–2025 Fortino Romero Mantilla. All rights reserved.

## 📞 Contact

- Website: https://foor.dev
- LinkedIn: https://linkedin.com/in/fortino-romero-mantilla
- GitHub: https://github.com/netfoor
- Email: fortino.rom@gmail.com

—

Specializing in AWS Cloud Solutions • DevOps Automation • Serverless Architecture
