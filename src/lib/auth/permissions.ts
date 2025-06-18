import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Check if the current user is in the ADMINS group
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    const authSession = await fetchAuthSession();
    const idTokenPayload = authSession.tokens?.idToken?.payload;
    const groups = (idTokenPayload?.['cognito:groups'] || []) as string[];
    
    return Array.isArray(groups) && groups.includes('ADMINS');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get the current user's groups from JWT token
 * @returns Promise<string[]> - array of group names
 */
export async function getUserGroups(): Promise<string[]> {
  try {
    const authSession = await fetchAuthSession();
    const idTokenPayload = authSession.tokens?.idToken?.payload;
    return (idTokenPayload?.['cognito:groups'] || []) as string[];
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}
