import React from 'react';
import { Metadata } from 'next';
import NotFoundClient from './NotFoundClient';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Project Not Found | Foor.dev',
    description: 'The requested project could not be found.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function NotFound() {
  // Use a default locale for the not-found page since we can't access params
  return <NotFoundClient locale="en" />;
}
