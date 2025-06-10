import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Certifications: a
    .model({
      title: a.string().required(),
      issuer: a.string().required(), 
      credentialId: a.string(),
      issueDate: a.date().required(),
      expirationDate: a.date(),
      badgeImageUrl: a.string(),
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
      photoUrl: a.string(),
      description: a.string().required(),
      place: a.string().required(),
      projectUrl: a.string(),
      skills: a.string().array(),
      gallery: a.string().array(),
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
      issuerUrl: a.string(),
      badgeImageUrl: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

    Education: a
    .model({
      institution: a.string().required(),
      degree: a.string().required(),
      fieldOfStudy: a.string(),
      startDate: a.date().required(),
      endDate: a.date(),
      description: a.string(),
      location: a.string(),
      recognition: a.string().array(),
      CertificateURL: a.string(),
      Photos: a.string().array(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]), 

    Languages: a
    .model({
      language: a.string().required(),
      proficiency: a.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

    Experiences: a
    .model({
      company: a.string().required(),
      position: a.string().required(),
      startDate: a.date().required(),
      endDate: a.date(),
      description: a.string(),
      location: a.string(),
      skills: a.string().array(),
      activities: a.string().array(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ]),

    SocialPublications: a
    .model({
      title: a.string().required(),
      source: a.enum(['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube']),
      image: a.string(),
      description: a.string().required(),
      publicationDate: a.date().required(),
      type: a.enum(['Article', 'Blog', 'Video', 'Podcast', 'Book', 'Course', 'Conference', 'Presentation', 'Research', 'Workshop', 'Other']),
      publicationUrl: a.string().required()
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.owner()
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
