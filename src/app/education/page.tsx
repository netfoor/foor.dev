import { Suspense } from 'react';
import EducationClient from './client-page-new';
import LoadingFallback from '../components/LoadingFallback';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Education',
  description: 'View my educational background and achievements',
};

export default function EducationPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <EducationClient />
      </Suspense>
    </ClientLayout>
  );
}
