import { signInWithRedirect, signOut as amplifySignOut } from 'aws-amplify/auth';

/**
 * Redirects the user to the Cognito Hosted UI for sign-in
 * @param customState Optional custom state to pass to the OAuth flow
 */
export const redirectToHostedUI = async (customState?: string) => {
  try {
    await signInWithRedirect({
      // No provider specified to show the Cognito Hosted UI
      customState
    });
  } catch (error) {
    console.error('Error redirecting to Hosted UI:', error);
    throw error;
  }
};

/**
 * Signs out the user and optionally redirects to a specific URL
 * @param redirectUrl Optional URL to redirect to after sign-out
 */
export const signOut = async (redirectUrl?: string) => {
  try {
    await amplifySignOut({
      global: true // Sign out from all devices
    });
    
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Extracts user information from Cognito user object
 * @param user Cognito user object
 * @returns Formatted user information
 */
export const formatUserInfo = (user: any) => {
  if (!user) return null;
  
  try {
    // Extract common user attributes
    return {
      username: user.username,
      email: user.attributes?.email,
      name: user.attributes?.name || `${user.attributes?.given_name || ''} ${user.attributes?.family_name || ''}`.trim(),
      sub: user.attributes?.sub,
      // Add any other attributes you need
    };
  } catch (error) {
    console.error('Error formatting user info:', error);
    return {
      username: user.username || 'Unknown User'
    };
  }
};