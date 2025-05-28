'use client';

import Hero from '@/app/components/Hero';
import { CertificationsSection, getFeaturedCertifications } from '@/app/components/certifications';
import { View } from '@aws-amplify/ui-react';
import AboutSection from '@/app/components/AboutSection';

export default function Home() {
  const featuredCertifications = getFeaturedCertifications(3);

  return (
    <View className="flex flex-col min-h-screen">
      <Hero />
      <AboutSection />
      <CertificationsSection 
        certifications={featuredCertifications}
        maxDisplay={3}
      />
    </View>
  );
}