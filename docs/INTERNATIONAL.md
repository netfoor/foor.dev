# Guide: Building a Fully Internationalized Serverless Application

This document outlines a comprehensive, step-by-step strategy for transforming a single-language web application into a fully multilingual platform. It covers not only static UI text but also dynamic, user-generated content stored in a database.

This guide is written for an AI agent or developer tasked with this implementation. The core principle is a reusable pattern: **Schema Modification → Backend Translation Service → Frontend UI Adaptation → Dynamic Rendering**.

We will use the `Projects` section of this application as the primary example. The same logic and steps can be replicated for any other data model (`Experiences`, `Skills`, `About`, etc.) that requires translation.

---

## 🎯 The Goal: True Internationalization

A truly internationalized application presents both its interface (UI) and its content (data) in the user's selected language.

- **Static Content**: UI elements like buttons, labels, and navigation. (This is already handled by `next-i18next` and `.json` translation files in this project).
- **Dynamic Content**: User-generated content stored in a database (e.g., project titles, descriptions, blog posts). This is our focus.

## ⚙️ The Core Concept: JSON Objects for Multilingual Fields

Instead of storing a simple string for a piece of text, we will store a JSON object in our database. Each key in the object will be a locale code (e.g., "en", "es", "ja"), and the value will be the translation for that language.

**Before:**
```json
{
  "title": "My Awesome Project"
}
```

**After:**
```json
{
  "title": {
    "en": "My Awesome Project",
    "es": "Mi Proyecto Increíble",
    "ja": "私の素晴らしいプロジェクト"
  }
}
```

This approach keeps all translations for a single piece of content within the same database record, making it efficient to fetch and manage.

---

## 🚀 Step-by-Step Implementation Workflow

### Step 1: Modify the Database Schema

The foundation of our strategy is to update the data models to support the JSON structure. In this AWS Amplify project, this is done in `amplify/data/resource.ts`.

1.  **Identify Translatable Fields**: Go through your schema and identify every field that stores user-generated text that needs to be displayed in multiple languages. For the `Projects` model, these are `title`, `description`, and `metaDescription`.

2.  **Change Field Type**: Modify the type of these fields from `a.string()` to `a.json()`. This tells Amplify that the field will store a structured JSON object, not a plain string.

    **Example: `amplify/data/resource.ts`**

    ```typescript
    // ... other imports
    import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

    const schema = a.schema({
      Projects: a.model({
        // --- MODIFICATION START ---
        title: a.json(), // Was: a.string().required()
        description: a.json(), // Was: a.string().required()
        // --- MODIFICATION END ---

        place: a.string(),
        projectUrl: a.url(),
        githubUrl: a.url(),
        demoUrl: a.url(),
        skills: a.string().array(),
        categories: a.enum(['Hackathon', 'Research', 'Professional', 'Academic', 'Personal']),
        photoKey: a.string(),
        galleryKeys: a.string().array(),
        startDate: a.date(),
        endDate: a.date(),
        status: a.enum(['Draft', 'Published', 'Archived']),
        featured: a.boolean(),
        slug: a.string().required(),

        // --- MODIFICATION START ---
        metaDescription: a.json(), // Was: a.string()
        // --- MODIFICATION END ---

        tags: a.string().array(),
      })
      .authorization(allow => [
        allow.owner(),
        allow.groups(['ADMINS']).to(['create', 'read', 'update', 'delete']),
        allow.public('identityPool').to(['read'])
      ]),
      
      // ... other models (Experiences, Skills, etc.) will follow the same pattern
    });

    export type Schema = ClientSchema<typeof schema>;

    export const data = defineData({
      schema,
      authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        // ...
      },
    });
    ```

3.  **Generate Updated Types**: After saving the schema changes, run the following command in your terminal. This will regenerate the TypeScript types (`./amplify/data/resource.ts`) that your frontend code uses, so it will be aware that `title` is now an object.

    ```bash
    npx ampx generate data
    ```

### Step 2: Create a Backend Translation Service

For security and efficiency, never call translation APIs directly from the frontend with exposed credentials. We will create a secure backend function that handles this.

1.  **Set up an Amplify Function**: Create a new Lambda function within your Amplify project. This function will act as a secure proxy to AWS Translate.

    ```bash
    npx ampx generate function
    ```
    Follow the prompts to create a new Lambda function (e.g., name it `translateText`).

2.  **Grant Permissions**: The Lambda function needs permission to call AWS Translate. In the function's configuration (`amplify/functions/translateText/resource.ts` or similar), grant the necessary IAM permissions.

    ```typescript
    // Example of granting permissions
    export const translateText = defineFunction({
      // ... other function settings
      runtime: 20,
      handler: 'handler',
      environment: {
        // ...
      },
      // Grant permission to the function to use AWS Translate
      actions: ['translate:TranslateText']
    });
    ```

3.  **Implement the Function Logic**: Write the code for the Lambda function. It should accept text, source language, and target languages, and return the translations.

    **Example: `amplify/functions/translateText/handler.ts`**

    ```typescript
    import { APIGatewayProxyHandler } from 'aws-lambda';
    import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

    const translateClient = new TranslateClient({ region: process.env.AWS_REGION });

    export const handler: APIGatewayProxyHandler = async (event) => {
      if (!event.body) {
        return { statusCode: 400, body: 'Missing request body' };
      }

      try {
        const { text, sourceLang = 'en', targetLangs = ['es', 'ja'] } = JSON.parse(event.body);

        if (!text || !targetLangs.length) {
          return { statusCode: 400, body: 'Missing text or target languages' };
        }

        const translations = {};

        for (const lang of targetLangs) {
          const command = new TranslateTextCommand({
            Text: text,
            SourceLanguageCode: sourceLang,
            TargetLanguageCode: lang,
          });
          const response = await translateClient.send(command);
          translations[lang] = response.TranslatedText;
        }

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(translations),
        };
      } catch (error) {
        console.error('Translation error:', error);
        return { statusCode: 500, body: 'Failed to translate text.' };
      }
    };
    ```

4.  **Expose the Function via API**: Create an Amplify API endpoint that triggers this function, so your frontend can call it.

### Step 3: Update the Admin Interface

Now, adapt the admin forms to handle multilingual input and to use the new translation service.

1.  **Update Form State**: Modify the component's state to hold separate values for each language.

    **Example: `src/app/[locale]/admin/projects/new/CreateProjectClient.tsx`**

    ```typescript
    interface ProjectFormData {
      title_en: string;
      title_es: string;
      title_ja: string;
      description_en: string;
      description_es: string;
      description_ja: string;
      metaDescription_en: string;
      metaDescription_es: string;
      metaDescription_ja: string;
      // ... other fields
    }

    const [formData, setFormData] = useState<ProjectFormData>({
      title_en: '',
      title_es: '',
      title_ja: '',
      // ... initialize other fields
    });
    ```

2.  **Create Multilingual Input Fields**: Update the JSX to include input fields for each language. You can group them with tabs or simply list them.

    ```tsx
    // Title fields
    <TextField label="Title (EN)" value={formData.title_en} onChange={...} />
    <TextField label="Title (ES)" value={formData.title_es} onChange={...} />
    <TextField label="Title (JA)" value={formData.title_ja} onChange={...} />

    // Description fields
    <TextAreaField label="Description (EN)" value={formData.description_en} onChange={...} />
    <TextAreaField label="Description (ES)" value={formData.description_es} onChange={...} />
    <TextAreaField label="Description (JA)" value={formData.description_ja} onChange={...} />
    ```

3.  **Implement the "Translate" Button**: Add a button that triggers the translation process. This provides a huge quality-of-life improvement for content creators.

    ```tsx
    const [isTranslating, setIsTranslating] = useState(false);

    const handleAutoTranslate = async () => {
      setIsTranslating(true);
      try {
        // This is a simplified example. You would call your actual API.
        const api = useYourAmplifyApi(); // Get reference to your API
        const response = await api.post('/translate', { 
          body: {
            texts: {
              title: formData.title_en,
              description: formData.description_en,
            },
            targetLangs: ['es', 'ja']
          }
        });
        
        const translations = response.body.json();

        setFormData(prev => ({
          ...prev,
          title_es: translations.es.title,
          title_ja: translations.ja.title,
          description_es: translations.es.description,
          description_ja: translations.ja.description,
        }));

      } catch (err) {
        // Handle error
      } finally {
        setIsTranslating(false);
      }
    };

    <Button onClick={handleAutoTranslate} disabled={isTranslating}>
      {isTranslating ? 'Translating...' : 'Auto-translate from English'}
    </Button>
    ```

4.  **Update the Submit Handler**: When submitting the form, assemble the data into the JSON structure required by the new schema.

    ```typescript
    const handleSubmit = async (event: React.FormEvent) => {
      // ...
      const result = await client.models.Projects.create({
        title: {
          en: formData.title_en,
          es: formData.title_es,
          ja: formData.title_ja,
        },
        description: {
          en: formData.description_en,
          es: formData.description_es,
          ja: formData.description_ja,
        },
        metaDescription: {
          en: formData.metaDescription_en,
          es: formData.metaDescription_es,
          ja: formData.metaDescription_ja,
        },
        // ... other fields
      });
      // ...
    };
    ```

### Step 4: Display Translated Content on the Frontend

The final step is to render the correct translation on your public-facing pages.

1.  **Fetch the Data**: Fetch the project data as you normally would. The `title` field, for example, will now be a JSON object.

2.  **Get the Current Locale**: Use Next.js routing parameters or a context to determine the current language.

3.  **Render the Correct Translation**: Access the correct language key from the JSON object. Always include a fallback to your primary language (`en`) in case a translation is missing.

    **Example: A project page component**

    ```tsx
    import { useParams } from 'next/navigation';

    function ProjectPage({ project }) { // project is fetched from your DB
      const { locale } = useParams(); // e.g., 'en', 'es', 'ja'

      // Select the correct translation with a fallback to English
      const title = project.title[locale] || project.title.en;
      const description = project.description[locale] || project.description.en;

      return (
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      );
    }
    ```

---

## 🔄 Generalizing the Process

You have now successfully implemented a full internationalization workflow for the `Projects` section. **This entire pattern is reusable.**

To internationalize other parts of your application, simply repeat these steps:

1.  **Identify the model**: Choose the next model to internationalize (e.g., `Experiences`).
2.  **Step 1 (Schema)**: Modify the text fields in `amplify/data/resource.ts` from `a.string()` to `a.json()` and regenerate types.
3.  **Step 2 (Backend)**: The `translateText` function is generic and can be reused for any text. No changes are needed here.
4.  **Step 3 (Admin UI)**: Update the corresponding admin form (e.g., `CreateExperienceClient.tsx`) with multilingual fields and the "Translate" button logic.
5.  **Step 4 (Frontend Display)**: Update the component that renders the experience to select the translation based on the current locale.

By following this guide, you can systematically and robustly build a truly global, serverless application on AWS.
