'use client';

import React from 'react';
import { View, Flex, Text } from '@aws-amplify/ui-react';
import Container from '@/components/ui/Container';
import SkillsSection from '@/components/ui/SkillsSection';

export default function SkillsPage() {
  return (
    <main>
      <SkillsSection showAll={true} />
    </main>
  );
}
