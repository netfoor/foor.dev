"use client";
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { signInWithRedirect } from 'aws-amplify/auth';
import { Flex, Heading, Loader, Text, Button } from '@aws-amplify/ui-react';
import amplifyconfig from '../../../amplify_outputs.json';

// Configure Amplify with the generated outputs
Amplify.configure(amplifyconfig, { ssr: true });

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  const handleSignIn = async () => {
    try {
      setLoading(true);
      
      // Redirect to Cognito Hosted UI without specifying provider
      // This will show the default Cognito login screen
      await signInWithRedirect({
        customState: JSON.stringify({ redirectUri: '/admin' })
      });
    } catch (err: any) {
      console.error('Error starting sign-in:', err);
      setError(err.message || 'Failed to start sign-in process');
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      
      // Redirect directly to Google sign-in
      await signInWithRedirect({
        provider: 'Google',
        customState: JSON.stringify({ redirectUri: '/admin' })
      });
    } catch (err: any) {
      console.error('Error starting Google sign-in:', err);
      setError(err.message || 'Failed to start Google sign-in process');
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" padding="2rem" minHeight="70vh">
      <Heading level={2} marginBottom="1rem">Admin Access</Heading>
      <Text marginBottom="2rem">
        This area is restricted to administrators. Please sign in with your admin account.
      </Text>
      
      {error && (
        <Text color="red" marginBottom="1rem">{error}</Text>
      )}
        {loading ? (
        <Flex direction="column" alignItems="center">
          <Loader size="large" />
          <Text marginTop="1rem">Redirecting to sign-in...</Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="1rem" alignItems="center">
          <Button
            variation="primary"
            size="large"
            onClick={handleSignIn}
            isLoading={loading}
          >
            Sign in with Email/Password
          </Button>
          
          <Text>-- or --</Text>
          
          <Button
            variation="primary"
            size="large"
            onClick={handleGoogleSignIn}
            isLoading={loading}
          >
            Sign in with Google
          </Button>
        </Flex>
      )}
      
      <Button
        variation="link"
        marginTop="2rem"
        onClick={() => window.location.href = '/'}
      >
        Return to Home
      </Button>
    </Flex>
  );
}
