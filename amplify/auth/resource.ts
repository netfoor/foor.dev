import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile'],
        attributeMapping: {
          email: 'email',
          givenName: 'given_name',
          familyName: 'family_name'
        },
      },
      callbackUrls: [
        'http://localhost:3000/auth/callback',
        'https://foor.dev/auth/callback',
        'https://www.foor.dev/auth/callback'
      ],
      logoutUrls: [
        'http://localhost:3000/',
        'https://foor.dev/',
        'https://www.foor.dev/'
      ],
    }
  },
  userAttributes: {
    givenName: {
      required: true,
      mutable: true,
    },
    familyName: {
      required: true,
      mutable: true,
    },
    email: {
      required: true,
      mutable: true,
    },
  },
  groups: ['ADMINS'],
});
