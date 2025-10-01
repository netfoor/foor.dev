import { Schema } from '../../amplify/data/resource';

type RecognitionCreate = Omit<Schema['Recognitions']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const recognitions: RecognitionCreate[] = [
  {
    title: 'Employee of the Month',
    description: 'Recognized for outstanding performance and dedication in Q1 2024.',
    issuer: 'Awesome Inc.',
    issueDate: '2024-04-01',
    credentialId: 'EOM-Q1-2024',
    issuerUrl: 'https://awesomeinc.com',
    photoKey: 'employee-of-month.png',
  },
  {
    title: 'Top Innovator Award',
    description: 'Awarded for developing a novel algorithm that improved data processing speed by 20%.',
    issuer: 'Innovation Hub',
    issueDate: '2023-10-15',
    issuerUrl: 'https://innovationhub.com',
    photoKey: 'innovator-award.png',
  },
  {
    title: 'Community Contribution Award',
    description: 'For significant contributions to the open-source community, including mentoring and code contributions.',
    issuer: 'Open Source Foundation',
    issueDate: '2023-07-22',
    photoKey: 'community-award.png',
  },
  {
    title: 'Public Speaking Champion',
    description: 'Winner of the annual company-wide public speaking competition.',
    issuer: 'Toastmasters at Work',
    issueDate: '2022-11-05',
    issuerUrl: 'https://toastmasters.org',
    photoKey: 'speaking-champion.png',
  },
  {
    title: 'Customer Service Excellence',
    description: 'Received for achieving a 99% customer satisfaction score over a six-month period.',
    issuer: 'ClientSuccess Co.',
    issueDate: '2022-06-30',
    photoKey: 'customer-service.png',
  },
];
