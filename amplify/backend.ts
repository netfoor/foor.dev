import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Define and configure your backend
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const backend = defineBackend({
  auth: {
    ...auth,
    // Configure Hosted UI settings
    oauth: {
      domain: 'auth.foor.dev', // Replace with your desired domain prefix
      scopes: ['email', 'openid', 'profile', 'aws.cognito.signin.user.admin'],
      redirectSignIn: ['http://localhost:3000/'],
      redirectSignOut: ['http://localhost:3000/'],
      responseType: 'code', // Authorization Code Grant flow
    },
    // Configure identity providers
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    },
  },
  data,
});
