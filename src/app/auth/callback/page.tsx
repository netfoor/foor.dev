'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import { getCurrentUser } from 'aws-amplify/auth';
import { Loader, Text, Flex } from '@aws-amplify/ui-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  const completeAuthAndRedirect = async () => {
    if (hasProcessed) return;
    
    try {
      setHasProcessed(true);
      
      // Wait for auth to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get current user to verify auth
      const user = await getCurrentUser();
      console.log('Auth callback - User:', user);
      
      // Redirect to intended destination or home
      const redirectTo = searchParams?.get('redirect') || '/en';
      router.push(redirectTo);
      
    } catch (error) {
      console.error('Auth callback error:', error);
      router.push('/en/login?error=callback_failed');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!hasProcessed) {
      completeAuthAndRedirect();
    }

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in via callback');
          if (!hasProcessed) {
            completeAuthAndRedirect();
          }
          break;        case 'signedOut':
          console.error('Sign in failed in callback');
          router.push('/en/login?error=signin_failed');
          break;
      }
    });

    return () => unsubscribe();
  }, []);
  if (isProcessing) {
    return (
      <Flex
        textAlign="center"
        padding="xl"
        minHeight="50vh"
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Flex direction="column" alignItems="center">
          <Loader size="large" />
          <Text marginTop="medium">Processing authentication...</Text>
        </Flex>
      </Flex>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <Flex
        textAlign="center"
        padding="xl"
        minHeight="50vh"
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Loader size="large" />
      </Flex>
    }>
      <CallbackContent />
    </Suspense>
  );
}
