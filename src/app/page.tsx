'use client';

import Hero from '@/app/components/Hero';
import NavBarHeader2 from '@/app/components/iu-plugin/NavBarHeader2';
import { View } from '@aws-amplify/ui-react';

export default function Home() {
  return (
    <View className="flex flex-col min-h-screen">
      {/* Barra de navegación */}
      <NavBarHeader2 />
      
      {/* Hero a pantalla completa */}
      <Hero />
    </View>
  );
}