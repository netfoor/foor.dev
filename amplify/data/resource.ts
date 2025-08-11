import { type ClientSchema, a, defineData } from '@aws-amplify/backend';


const schema = a.schema({
  Certifications: a
    .model({
      title: a.string().required(),
      issuer: a.string().required(),
      credentialId: a.string(),
      credentialUrl: a.string(),
      issueDate: a.date().required(),
      expirationDate: a.date(),
      photoKey: a.string(), 
      content: a.string(),
      skills: a.string().array(),
      category: a.enum(['Technology', 'Business', 'Arts', 'Health', 'Languages']),
      slug: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
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
      photoKey: a.string(), 
      galleryKeys: a.string().array(), 
      // Metadata adicional
      startDate: a.date(),
      endDate: a.date(),
      status: a.enum(['Draft', 'Published', 'Archived']),
      featured: a.boolean(),
      // SEO
      slug: a.string(),      
      metaDescription: a.string(),
      tags: a.string().array(),
    }).authorization((allow) => [
      allow.publicApiKey().to(['read']),
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
      photoKey: a.string(), 
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
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
      photoKey: a.string(), 
      Photos: a.string().array(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),
  Languages: a
    .model({
      language: a.string().required(),
      proficiency: a.enum(['Basic', 'Conversational', 'Fluent', 'Native']),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
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
      photoKey: a.string(), 
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),
  SocialPublications: a
    .model({
      title: a.string().required(),
      source: a.enum(['LinkedIn', 'Twitter', 'GitHub', 'Blog', 'Youtube']),
      photoKey: a.string(), 
      description: a.string().required(),
      publicationDate: a.date().required(),
      type: a.enum(['Article', 'Blog', 'Video', 'Podcast', 'Book', 'Course', 'Conference', 'Presentation', 'Research', 'Workshop', 'Other']),
      publicationUrl: a.string().required()
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),

  Profile: a
    .model({
      name: a.string().required(),
      currentPosition: a.string().required(),
      description: a.string().required(),
      profilePhotoKey: a.string(), // Key de S3 para la foto de perfil
      flags: a.string().array(), // ["Cloud Engineer", "AWS Advocate", "DevOps Enthusiast"]
      mission: a.string(),
      vision: a.string(),
      philosophy: a.string(),
      isActive: a.boolean(), // Solo uno activo a la vez
      // Enlaces de redes sociales
      linkedinUrl: a.string(),
      githubUrl: a.string(),
      twitterUrl: a.string(),
      emailContact: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),

  Skills: a
    .model({
      name: a.string().required(),
      category: a.enum(['CLOUD_PLATFORMS', 'PROGRAMMING_LANGUAGES', 'FRAMEWORKS_LIBRARIES', 'DEVOPS_TOOLS', 'DATABASES', 'ARCHITECTURE_DESIGN', 'SOFT_SKILLS']),
      type: a.enum(['Technical', 'Soft']),
      proficiency: a.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
      yearsOfExperience: a.integer(),
      description: a.string(),
      certifications: a.string().array(), // Related certifications
      projects: a.string().array(), // Related project IDs
      iconKey: a.string(), // S3 key for skill icon/logo
      priority: a.integer(), // For ordering
      isActive: a.boolean(), // Show/hide skill
      isCore: a.boolean(), // Mark as core skill for homepage
      lastUsed: a.date(), // When this skill was last used
      // Soft skill specific fields
      examples: a.string().array(), // Examples of how this skill was applied
      achievements: a.string().array(), // Achievements related to this skill
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
    ]),


});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});