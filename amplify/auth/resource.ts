import { defineAuth, secret } from '@aws-amplify/backend';
import { env } from 'node:process';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile']
      },
      callbackUrls: ['http://localhost:3000/auth/callback'],
      logoutUrls: ['http://localhost:3000/']
    }
  }
});