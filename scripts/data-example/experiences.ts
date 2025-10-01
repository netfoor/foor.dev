
import { Schema } from '../../amplify/data/resource';

type ExperienceCreate = Omit<Schema['Experiences']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const experiences: ExperienceCreate[] = [
  {
    company: 'Tech Solutions Inc.',
    position: 'Senior Software Engineer',
    startDate: '2020-01-15',
    endDate: '2024-06-30',
    description: 'Led the development of a new cloud-native platform, improving scalability and reducing costs by 30%.',
    location: 'San Francisco, CA',
    skills: ['AWS', 'Kubernetes', 'Go', 'React'],
    activities: ['Mentored junior engineers', 'Presented at tech talks'],
    photoKey: 'tech-solutions-logo.png',
  },
  {
    company: 'Innovatech',
    position: 'Software Engineer',
    startDate: '2018-06-01',
    endDate: '2019-12-31',
    description: 'Developed and maintained features for a large-scale e-commerce application.',
    location: 'New York, NY',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'JavaScript'],
    activities: ['Participated in code reviews', 'Collaborated with product managers'],
  },
  {
    company: 'Data Analytics Corp.',
    position: 'Data Science Intern',
    startDate: '2017-05-20',
    endDate: '2017-08-20',
    description: 'Assisted the data science team with data cleaning, analysis, and visualization.',
    location: 'Boston, MA',
    skills: ['Python', 'Pandas', 'Matplotlib', 'SQL'],
  },
  {
    company: 'Freelance',
    position: 'Web Developer',
    startDate: '2016-01-01',
    description: 'Built and maintained websites for small businesses.',
    location: 'Remote',
    skills: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
  },
  {
    company: 'Open Source Contributor',
    position: 'Contributor',
    startDate: '2021-01-01',
    description: 'Contributed to various open-source projects on GitHub.',
    location: 'Remote',
    skills: ['Git', 'TypeScript', 'Node.js'],
  },
];
