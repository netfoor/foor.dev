import { Suspense } from 'react';
import LanguagesClient from './client-page-new';
import LoadingFallback from '../components/LoadingFallback';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Languages',
  description: 'View my language proficiencies and skills',
};

export default function LanguagesPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <LanguagesClient />
      </Suspense>
    </ClientLayout>
  );
}
