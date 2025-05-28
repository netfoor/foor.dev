'use client';

import { ThemeProvider } from '@aws-amplify/ui-react';

export function AmplifyWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

