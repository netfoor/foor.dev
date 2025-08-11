import { Amplify } from 'aws-amplify';
import { signIn, signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../amplify/data/resource';
import { certifications } from './data-example/certifications';
import { projects } from './data-example/projects';
import { recognitions } from './data-example/recognitions';
import { education } from './data-example/education';
import { languages } from './data-example/languages';
import { experiences } from './data-example/experiences';
import { socialPublications } from './data-example/social-publications';
import { profiles } from './data-example/profiles';
import { skills } from './data-example/skills';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

const client = generateClient<Schema>();

async function seedDatabase() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error('Please provide ADMIN_USERNAME and ADMIN_PASSWORD environment variables.');
    return;
  }

  try {
    console.log(`Signing in as ${username}...`);
    await signIn({ username, password });
    console.log('Sign-in successful.');

    console.log('Seeding database...');

    // Seed Certifications
    for (const cert of certifications) {
      await client.models.Certifications.create(cert, { authMode: 'userPool' });
    }
    console.log('Certifications seeded.');

    // Seed Projects
    for (const project of projects) {
      await client.models.Projects.create(project, { authMode: 'userPool' });
    }
    console.log('Projects seeded.');

    // Seed Recognitions
    for (const recognition of recognitions) {
      await client.models.Recognitions.create(recognition, { authMode: 'userPool' });
    }
    console.log('Recognitions seeded.');

    // Seed Education
    for (const edu of education) {
      await client.models.Education.create(edu, { authMode: 'userPool' });
    }
    console.log('Education seeded.');

    // Seed Languages
    for (const lang of languages) {
      await client.models.Languages.create(lang, { authMode: 'userPool' });
    }
    console.log('Languages seeded.');

    // Seed Experiences
    for (const exp of experiences) {
      await client.models.Experiences.create(exp, { authMode: 'userPool' });
    }
    console.log('Experiences seeded.');

    // Seed SocialPublications
    for (const pub of socialPublications) {
      await client.models.SocialPublications.create(pub, { authMode: 'userPool' });
    }
    console.log('SocialPublications seeded.');

    // Seed Profile
    for (const profile of profiles) {
      await client.models.Profile.create(profile, { authMode: 'userPool' });
    }
    console.log('Profile seeded.');

    // Seed Skills
    for (const skill of skills) {
      await client.models.Skills.create(skill, { authMode: 'userPool' });
    }
    console.log('Skills seeded.');

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    try {
      await signOut();
      console.log('Sign-out successful.');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

seedDatabase();
