
import { Schema } from '../../amplify/data/resource';

type LanguageCreate = Omit<Schema['Languages']['type'], 'id' | 'createdAt' | 'updatedAt'>;

export const languages: LanguageCreate[] = [
  {
    language: 'English',
    proficiency: 'Native',
  },
  {
    language: 'Spanish',
    proficiency: 'Fluent',
  },
  {
    language: 'German',
    proficiency: 'Conversational',
  },
  {
    language: 'Japanese',
    proficiency: 'Basic',
  },
  {
    language: 'French',
    proficiency: 'Basic',
  },
];
