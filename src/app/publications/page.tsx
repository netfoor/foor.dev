import { Suspense } from 'react';
import PublicationsClient from './client-page-new';
import LoadingFallback from '../components/LoadingFallback';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Publications',
  description: 'View my articles, posts, and other publications',
};

export default function PublicationsPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <PublicationsClient />
      </Suspense>
    </ClientLayout>
  );
}
  
