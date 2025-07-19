
import { Schema } from '../../amplify/data/resource';

type ProfileCreate = Omit<Schema['Profile']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const profiles: ProfileCreate[] = [
  {
    name: 'John Doe',
    currentPosition: 'Senior Cloud Engineer at Tech Solutions Inc.',
    description: 'A passionate and experienced cloud engineer with a focus on AWS and DevOps. I enjoy building scalable and resilient infrastructure.',
    profilePhotoKey: 'john-doe-profile.jpg',
    flags: ['Cloud Engineer', 'AWS Advocate', 'DevOps Enthusiast'],
    mission: 'To leverage cloud technologies to solve complex problems and drive business value.',
    vision: 'A future where technology is seamlessly integrated into our lives to improve our world.',
    philosophy: 'Continuous learning and improvement.',
    isActive: true,
    linkedinUrl: 'https://www.linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    twitterUrl: 'https://twitter.com/johndoe',
    emailContact: 'john.doe@example.com',
  },
  // Add 4 more profile examples here if needed, but typically there is only one active profile.
  // For the purpose of this example, we will only create one.
];
