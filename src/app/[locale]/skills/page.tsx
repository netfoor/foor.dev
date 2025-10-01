'use client';

import React from 'react';
import { View, Flex, Text } from '@aws-amplify/ui-react';
import Container from '@/components/ui/Container';
import SkillsSection from '@/components/ui/SkillsSection';
import Footer from '@/components/ui/Footer';
import HeaderControls from '@/components/ui/HeaderControls';

export default function SkillsPage() {
  return (
    <main>
      {/* Header con controles de idioma y tema */}
      <HeaderControls />
      <SkillsSection showAll={true} />

      {/* Footer */}
      <Footer />
    </main>
  );
}
