import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Certifications: a
    .model({
      title: a.string().required(),
      issuer: a.string().required(), 
      credentialId: a.string(),
      issueDate: a.date().required(),
      expirationDate: a.date(),
      badgeImageUrl: a.string(),      content: a.string(),
      skills: a.string().array(),
      categoty: a.string().required(),
    })    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),

  Projects: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      place: a.string().required(),
      projectUrl: a.string(),
      githubUrl: a.string(),
      demoUrl: a.string(),
      skills: a.string().array(),
      categories: a.enum(['Hackathon', 'Research', 'Professional', 'Academic', 'Personal']),
      // Storage paths para las imágenes
      photoKey: a.string(), // Key de S3 para la imagen principal
      galleryKeys: a.string().array(), // Array de keys de S3 para la galería
      // Metadata adicional
      startDate: a.date(),
      endDate: a.date(),
      status: a.enum(['Draft', 'Published', 'Archived']),
      featured: a.boolean(),
      // SEO
      slug: a.string(),      metaDescription: a.string(),
      tags: a.string().array(),
    })    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
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
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
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
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),
  Languages: a
    .model({
      language: a.string().required(),
      proficiency: a.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
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
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
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
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
