import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Certifications: a
    .model({
      title: a.string().required(),
      issuer: a.string().required(),
      issuerUrl: a.url(),
      credentialId: a.string(),
      issueDate: a.date().required(),
      expirationDate: a.date(),
      badgeImageUrl: a.url(),
      content: a.string(),
      skills: a.string().array(),
      categoty: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

  Projects: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      projectUrl: a.url(),
      skills: a.string().array(),
      categories: a.enum(['Hackathon', 'Research', 'Professional', 'Academic', 'Personal']),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

    Recognitions: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      issuer: a.string().required(),
      issueDate: a.date().required(),
      credentialId: a.string(),
      issuerUrl: a.url(),
      badgeImageUrl: a.url(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

    
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
