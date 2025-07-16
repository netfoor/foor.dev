

# 🌍 Internationalization Strategy for Dynamic Content

## 📦 Overview

This project implements a **full internationalization (i18n)** strategy for both:

* Static UI text (buttons, labels, menus)
* **Dynamic, user-generated content** (blog posts, projects, etc.)

Our chosen solution uses:
✅ JSON multilingual fields in the database
✅ Serverless backend translation service
✅ Locale-aware frontend rendering

This balances **developer ergonomics, editor usability, scalability and performance**, without duplicating content or tables.

---

## ✏️ Why this approach?

Traditional i18n solutions only handle static UI text via `.json` files.
Dynamic content (e.g. blogs, projects) must also be multilingual:

* Users want to read blog posts in their language.
* Editors shouldn't copy-paste content into multiple tables.
* AI translation can automate draft translations; editors can later improve them.

To solve this:

* We store each multilingual field as a JSON object:

  ```json
  {
    "title": {
      "en": "My Awesome Post",
      "es": "Mi Publicación Asombrosa",
      "ja": "素晴らしい投稿"
    }
  }
  ```
* The backend handles translation (via AWS Translate or similar).
* The frontend reads the correct locale dynamically.

---

## 🏗 How it works

**Step 1: Author writes in English**
**Step 2: Backend function auto-translates to target languages**
**Step 3: Store all translations in the same DB record**
**Step 4: Frontend renders `title[locale]` (fallback to `en` if missing)**

---

## 🛠 Data Model Example

| Field       |                  Type |
| ----------- | --------------------: |
| title       | JSON `{ en, es, ja }` |
| description | JSON `{ en, es, ja }` |
| slug        |                String |
| createdAt   |                  Date |

---

## 🔧 Admin UI

Content creators:

* Edit text in the default language (English).
* Click “Auto-translate” → backend returns `es`, `ja` versions.
* Manually review & adjust translations.

---

## ⚙️ Serverless Translation Service

* **Lambda function** securely calls AWS Translate.
* Stores translations together in DB.
* Avoids exposing API keys to frontend.

---

## 📈 Scalability & why it’s professional

✅ One single DB record keeps all translations in sync
✅ No joins or separate tables → works great with NoSQL & serverless
✅ Used by:

* Headless CMSs (Contentful, Sanity, Strapi): store per-locale fields.
* SaaS apps (Shopify, Slack): localize dynamic & static content separately.
  ✅ Editors can easily see what’s missing.

---

## 🧩 Fallback & SEO

* `project.title[locale] ?? project.title.en` → never show empty content.
* Add `<link rel="alternate" hreflang="...">` tags for SEO.

---

## 🔄 Flow Diagram

```mermaid
graph TD
  A[Editor writes in English] --> B[Calls /translate backend API]
  B --> C{AWS Translate}
  C --> D[Receive es & ja texts]
  D --> E[Store JSON: { en, es, ja }]
  E --> F[Frontend fetches data]
  F --> G[Render title[locale] or title.en]
```

---

## 🧰 Compared to other methods

| Method                                | Pros                                 | Cons                  |
| ------------------------------------- | ------------------------------------ | --------------------- |
| Duplicate rows/tables per language    | Simple SQL                           | Hard to keep in sync  |
| Headless CMS per-locale fields        | Editorial workflow                   | Cost, vendor lock-in  |
| JSON multilingual fields (our choice) | Fast, single record, editor-friendly | Needs custom admin UI |

---

## ✅ Summary

* 🧠 Keep static text in `.json` files → `next-i18next`
* 🌍 Keep dynamic content in JSON multilingual fields
* ⚙️ Backend translates & keeps them together
* ⚡ Frontend reads by locale with fallback

> This approach is modern, maintainable, and used by real production apps.

---

## 📚 References

* [Contentful: Localization](https://www.contentful.com/developers/docs/concepts/locales/)
* [Sanity: Internationalization](https://www.sanity.io/docs/introduction-internationalization)
* [AWS Translate](https://docs.aws.amazon.com/translate/latest/dg/what-is.html)

---

## 🧪 Want to contribute?

Add support for more languages:

* Update schema
* Update admin UI
* Adjust translation backend

