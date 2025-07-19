
import { Schema } from '../../amplify/data/resource';

type SocialPublicationCreate = Omit<Schema['SocialPublications']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const socialPublications: SocialPublicationCreate[] = [
  {
    title: 'Getting Started with AWS Lambda',
    source: 'Blog',
    photoKey: 'lambda-blog-post.jpg',
    description: 'A comprehensive guide for beginners on how to create and deploy their first AWS Lambda function.',
    publicationDate: '2024-02-28',
    type: 'Article',
    publicationUrl: 'https://mytechblog.com/getting-started-with-aws-lambda',
  },
  {
    title: 'The Power of Infrastructure as Code with Terraform',
    source: 'LinkedIn',
    description: 'An article discussing the benefits of using Terraform for managing cloud infrastructure.',
    publicationDate: '2023-11-10',
    type: 'Article',
    publicationUrl: 'https://www.linkedin.com/pulse/power-infrastructure-code-terraform-yourname',
  },
  {
    title: 'Live Coding Session: Building a REST API with Node.js',
    source: 'Youtube',
    photoKey: 'youtube-live-coding.jpg',
    description: 'A recorded live stream of building a REST API from scratch using Node.js and Express.',
    publicationDate: '2023-08-15',
    type: 'Video',
    publicationUrl: 'https://www.youtube.com/watch?v=abcdef12345',
  },
  {
    title: 'Thoughts on the Future of AI',
    source: 'Twitter',
    description: 'A thread of tweets sharing my thoughts and predictions on the future of Artificial Intelligence.',
    publicationDate: '2024-01-05',
    type: 'Other',
    publicationUrl: 'https://twitter.com/yourusername/status/1234567890',
  },
  {
    title: 'My Journey into Tech',
    source: 'GitHub',
    description: 'Appeared as a guest on the "Tech Journeys" podcast to talk about my career path.',
    publicationDate: '2022-09-20',
    type: 'Podcast',
    publicationUrl: 'https://techjourneys.com/episode/my-journey-into-tech-with-yourname',
  },
];
