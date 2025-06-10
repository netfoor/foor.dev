"use client";
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import amplifyconfig from '../../../amplify_outputs.json';
import { formatUserInfo } from '../../auth/cognito-helpers';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, Button, Heading, Text, View, useTheme } from '@aws-amplify/ui-react';

// Configure Amplify with the generated outputs
Amplify.configure(amplifyconfig, { ssr: true });


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {  const [user, setUser] = useState<any>(null); // Consider using a more specific type for user
  const [loading, setLoading] = useState(true);  
    useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        setUser(null);
        
        // Add a small delay before redirecting to ensure state is updated
        setTimeout(async () => {
          try {
            await signInWithRedirect({
              // No provider specified to show Cognito Hosted UI
              customState: JSON.stringify({ redirectUri: '/admin' })
            });
          } catch (redirectError) {
            console.error("Error redirecting to sign-in:", redirectError);
          } finally {
            setLoading(false);
          }
        }, 500);
      }
    };

    checkUser();

    // Listen for auth events
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
      console.log('Auth event:', payload.event);
      
      switch (payload.event) {
        case 'signedIn':
          getCurrentUser()
            .then(currentUser => {
              setUser(currentUser);
              setLoading(false);
            })
            .catch(error => {
              console.error('Error getting current user after sign-in:', error);
              setUser(null);
              setLoading(false);
            });
          break;
          
        case 'signedOut':
          setUser(null);
          setLoading(false);
          break;
      }
    });

    return () => {
      if (typeof hubListenerCancel === 'function') {
        hubListenerCancel();
      }
    };
  }, []);
  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={3}>Loading...</Heading>
      </View>
    );
  }
  if (!user) {
    return (
      <View padding="2rem" textAlign="center">
        <Heading level={3}>Se requiere autenticación</Heading>
        <Text marginBottom="1rem">Debes iniciar sesión para acceder al área de administración.</Text>
        <Button 
          onClick={() => window.location.href = '/signin'}
          variation="primary"
        >
          Ir a iniciar sesión
        </Button>
      </View>
    );
  }

  const userInfo = user ? formatUserInfo(user) : null;
  const userDisplayName = userInfo?.name || userInfo?.email || userInfo?.username || 'User';

  return (
    <main>
      <View
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="1rem"
        style={{
          borderBottom: '1px solid var(--amplify-colors-border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Heading level={4} margin="0">Admin Dashboard</Heading>
        <View style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Text>Welcome, {userDisplayName}</Text>
          <Button variation="primary" onClick={handleSignOut}>Sign Out</Button>
        </View>
      </View>
      
      <View padding="1rem">
        {children}
      </View>
    </main>
  );
}
