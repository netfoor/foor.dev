import { Suspense } from 'react';
import ClientPage from './client-page';
import LoadingFallback from '../components/LoadingFallback';
import ClientLayout from '../components/ClientLayout';

export const metadata = {
  title: 'Certifications',
  description: 'Professional certifications and qualifications',
};

export default function CertificationsPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <ClientPage />
      </Suspense>
    </ClientLayout>
  );
}
