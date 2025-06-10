'use client';

import { View } from '@aws-amplify/ui-react';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <View className="flex flex-col min-h-screen">
      {children}
    </View>
  );
}
