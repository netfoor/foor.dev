"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from 'aws-amplify/auth';
import { Flex, Heading, Loader, Text } from '@aws-amplify/ui-react';
import amplifyconfig from '../../../../amplify_outputs.json';

// Configure Amplify with the generated outputs
Amplify.configure(amplifyconfig, { ssr: true });

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirectUri = searchParams.get('redirectUri') || '/admin';
  
  useEffect(() => {
    // Check for error in URL parameters
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      console.error('Error in callback URL:', errorParam, errorDescription);
      setError(`${errorParam}: ${errorDescription}`);
      // If there's an error, return to home after a delay
      setTimeout(() => {
        router.push('/');
      }, 5000);
      return;
    }      const handleCallback = async () => {
      try {
        // Add a delay to ensure Amplify has time to process tokens
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // After Cognito redirects back to this page, we should already be authenticated
        const user = await getCurrentUser();
        
        // Redirect to the admin page or other specified destination
        router.push(redirectUri);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(`Authentication failed: ${err.message}`);
        
        // If authentication fails, provide a way back
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    };

    handleCallback();
  }, [router, redirectUri, searchParams]);
  if (error) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Heading level={3} color="red">Authentication Error</Heading>
        <Text>{error}</Text>
        
        <Flex direction="column" padding="1rem" margin="1rem" backgroundColor="#f5f5f5" borderRadius="5px" maxWidth="800px">
          <Heading level={5}>Debugging Information</Heading>
          <Text fontSize="small">URL Parameters:</Text>
          <Text fontSize="small" fontFamily="monospace" whiteSpace="pre-wrap">
            {Array.from(searchParams.entries()).map(([key, value]) => `${key}: ${value}`).join('\n')}
          </Text>
        </Flex>
        
        <button 
          onClick={() => router.push('/')}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: 'var(--amplify-colors-brand-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Return Home
        </button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" height="100vh">
      <Heading level={3}>Completing Authentication</Heading>
      <Loader size="large" />
      <Text marginTop="1rem">Please wait while we complete the authentication process...</Text>
    </Flex>
  );
}
