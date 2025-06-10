'use client';

// Import AWS Amplify UI components in a client component
import { Flex, Loader, View } from '@aws-amplify/ui-react';

export default function LoadingFallback() {
  return (
    <Flex justifyContent="center" padding="2rem">
      <Loader size="large" />
    </Flex>
  );
}
