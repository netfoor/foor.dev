I’ll open the auth resource file to see how OAuth/redirect URLs are configured and ensure we add foor.dev accordingly. Then I’ll check hosting/infra to wire the custom domain. Updating the Cognito OAuth callback and logout URLs to include https://foor.dev and https://www.foor.dev so sign-in works on your custom domain; then I’ll summarize the remaining AWS Amplify domain steps. 
```


Made changes.


```
I’ll wire up foor.dev as a custom domain for your Amplify-hosted Next.js app and ensure auth redirects are correct.

Checklist
- Add the custom domain in Amplify Hosting (foor.dev + www.foor.dev) and pick your primary.
- Create/verify DNS records (Route 53: auto; external registrar: CNAME/ALIAS).
- Issue/validate SSL in Amplify.
- Update Cognito OAuth callback/logout URLs to include your domain (done in code).
- Confirm Google OAuth settings (Cognito idpresponse URL).
- Deploy backend changes and test sign-in/sign-out.

## Actions taken
- Updated Cognito app client URLs to include production:
  - callbackUrls: https://foor.dev/auth/callback, https://www.foor.dev/auth/callback (kept localhost)
  - logoutUrls: https://foor.dev/, https://www.foor.dev/ (kept localhost)
- File changed: resource.ts

## Add the domain in Amplify Hosting
- In AWS Console → Amplify Hosting → Your App → Domain management → Add domain.
- Enter foor.dev. Select:
  - Root/apex: foor.dev
  - www: www.foor.dev
- Choose your primary:
  - Prefer apex (foor.dev) as primary and set a redirect from www → apex, or vice versa.
- If your DNS is in Route 53 and a hosted zone exists, Amplify will create A/AAAA ALIAS and CNAME records automatically.
- If DNS is external, Amplify will show records to add:
  - Root (foor.dev): create ALIAS/ANAME to the Amplify CloudFront target (or a CNAME if your provider supports it for apex via ANAME/ALIAS).
  - www (www.foor.dev): CNAME to the Amplify target.
- Wait for SSL issuance/validation to complete. Amplify provisions ACM certificates for both domains.

## Auth/OAuth considerations
- Cognito Hosted UI callback/logout URLs now include your domain (already edited in amplify/auth/resource.ts).
- For Google as IdP: ensure the “Authorized redirect URI” in Google Cloud Console points to your Cognito domain’s idpresponse URL (format: https://<your-cognito-domain>.auth.<region>.amazoncognito.com/oauth2/idpresponse). This is separate from your site domain and typically does not change when adding foor.dev.
- After DNS/SSL are green, test:
  - https://foor.dev and https://www.foor.dev load the site.
  - Sign-in flow completes and returns to https://foor.dev/auth/callback.
  - Sign-out returns to https://foor.dev/.

## Deploy backend changes
- Push the auth change so Cognito gets the new URLs, then redeploy the app. On Windows PowerShell, from the repo root:
  - If you use Amplify Gen 2 via CI: commit and push; Amplify will provision the backend from code.
  - If you manage a local sandbox, deploy the backend using your standard Amplify Gen 2 command for this project.

## Optional cleanups
- Canonical redirect: in Amplify Domain settings, set a 301 from non-primary (e.g., www) to your primary (e.g., apex).
- Robots/sitemaps: ensure they resolve under the primary domain.
- Cookies: Cognito cookies are on your site domain; nothing extra needed unless you customize domains.

Want me to run a quick deploy of the backend change now or revert the code tweak if you prefer to add URLs manually in the console?