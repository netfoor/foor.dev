'use client';

import Hero from '@/app/components/Hero';
import { View } from '@aws-amplify/ui-react';

export default function Home() {
  return (
    <View className="flex flex-col min-h-screen">
      
      <Hero />
    </View>
  );
}