'use client';

import { ReactNode } from 'react';
import { View } from '@aws-amplify/ui-react';

export default function Container({ children }: { children: ReactNode }) {
  return (
    <View
      maxWidth="80rem"
      margin="0 auto"
      paddingInline={{ base: '1.5rem', medium: '3rem' }}
    >
      {children}
    </View>
  );
}
