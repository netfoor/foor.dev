import { Suspense } from 'react';
import ExperienceClient from './client-page';
import LoadingFallback from '../components/LoadingFallback';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Work Experience',
  description: 'View my professional work experience and career history',
};

export default function ExperiencePage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ExperienceClient />
      </Suspense>
    </ClientLayout>
  );
}
