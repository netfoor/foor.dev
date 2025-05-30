'use client';

import Hero from '@/app/components/Hero';
import { CertificationsSection, getFeaturedCertifications } from '@/app/components/certifications';
import { ProjectsSection, getFeaturedProjects } from '@/app/components/projects';
import RecognitionsSection from '@/app/components/recognitions/RecognitionsSection';
import PublicationsSection from '@/app/components/publications/PublicationsSection';
import { SkillsSection } from '@/app/components/skills';
import { View } from '@aws-amplify/ui-react';
import AboutSection from '@/app/components/AboutSection';

export default function Home() {
  const featuredCertifications = getFeaturedCertifications(3);
  const featuredProjects = getFeaturedProjects(4);
  return (    <View className="flex flex-col min-h-screen">
      <Hero />
      <AboutSection />
      <SkillsSection />
      <CertificationsSection 
        certifications={featuredCertifications}
        maxDisplay={3}
      />      
      <ProjectsSection 
        projects={featuredProjects}
        maxDisplay={4}
      />
      <RecognitionsSection />
      <PublicationsSection />
    </View>
  );
}