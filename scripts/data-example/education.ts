
import { Schema } from '../../amplify/data/resource';

type EducationCreate = Omit<Schema['Education']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const education: EducationCreate[] = [
  {
    institution: 'University of Technology',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2018-09-01',
    endDate: '2022-06-15',
    description: 'Focused on software engineering, algorithms, and data structures.',
    location: 'Techville, USA',
    recognition: ['Dean\'s List 2021', 'Top Project Award'],
    CertificateURL: 'https://university.edu/transcript/12345',
    photoKey: 'university-campus.jpg',
    Photos: ['graduation-1.jpg', 'project-presentation.jpg'],
  },
  {
    institution: 'Online Learning Platform',
    degree: 'Certificate in Cloud Computing',
    fieldOfStudy: 'AWS and Azure',
    startDate: '2022-07-01',
    endDate: '2022-12-31',
    description: 'Completed a 6-month intensive course on cloud technologies.',
    location: 'Online',
    CertificateURL: 'https://online-learning.com/certificate/67890',
    photoKey: 'cloud-certificate.png',
  },
  {
    institution: 'Community College',
    degree: 'Associate of Arts',
    fieldOfStudy: 'Graphic Design',
    startDate: '2016-09-01',
    endDate: '2018-06-15',
    description: 'Studied fundamentals of design, typography, and digital media.',
    location: 'Artville, USA',
  },
  {
    institution: 'Language School',
    degree: 'Diploma of Spanish as a Foreign Language',
    fieldOfStudy: 'Spanish Language and Culture',
    startDate: '2023-01-10',
    endDate: '2023-07-10',
    description: 'Intensive language program to achieve fluency.',
    location: 'Madrid, Spain',
    CertificateURL: 'https://languageschool.es/diploma/11223',
  },
  {
    institution: 'High School of Science',
    degree: 'High School Diploma',
    fieldOfStudy: 'Science and Mathematics',
    startDate: '2012-09-01',
    endDate: '2016-06-15',
    description: 'Graduated with honors in science and math.',
    location: 'Scienceville, USA',
  },
];
