"use client";

import { useEffect, useState } from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';
import { redirectToHostedUI, signOut } from '../../auth/cognito-helpers';
import { useAuth } from '../../auth/AuthContext';
import { isAdmin } from '../../auth/admin-helpers';

export default function AuthButtons() {
  const { user, loading, userInfo } = useAuth();
  const [showButtons, setShowButtons] = useState(false);
  
  useEffect(() => {
    // Check if we're on the admin page - always show buttons there
    const isAdminPage = window.location.pathname.startsWith('/admin');
    
    // Only show buttons if we're on admin page or if current user is admin
    setShowButtons(isAdminPage || isAdmin(user));
  }, [user]);
  const handleSignIn = async () => {
    try {
      // Redirect to the dedicated sign-in page instead of directly calling Cognito
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(window.location.origin);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || !showButtons) {
    return null;
  }

  const userDisplayName = userInfo?.name || userInfo?.email || userInfo?.username;

  return (
    <Flex gap="8px" alignItems="center">
      {user ? (
        <>
          <Text fontSize="small" fontWeight="normal">Hello, {userDisplayName}</Text>
          <Button
            variation="primary"
            size="small"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
          <Button
            variation="link"
            size="small"
            onClick={() => window.location.href = '/admin'}
          >
            Admin
          </Button>
        </>
      ) : (
        <Button
          variation="primary"
          size="small"
          onClick={handleSignIn}
        >
          Sign In
        </Button>
      )}
    </Flex>
  );
}
