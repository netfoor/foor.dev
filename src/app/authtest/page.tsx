"use client";
import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Flex, Heading, Text, Button, Loader, Card, Divider } from '@aws-amplify/ui-react';
import amplifyconfig from '../../../amplify_outputs.json';

// Configure Amplify with the generated outputs
Amplify.configure(amplifyconfig, { ssr: true });

export default function AuthTestPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logMsg, setLogMsg] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogMsg(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };
  const checkAuth = async () => {
    setLoading(true);
    setError(null);
    addLog('Checking authentication...');
    
    try {
      // Try to get current user
      addLog('Attempting to get current user');
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      addLog(`User found: ${currentUser.username}`);
        // Try to get session tokens
      addLog('Attempting to fetch auth session');
      const authSession = await fetchAuthSession();
      setSession(authSession);
      addLog('Auth session retrieved successfully');
      
      if (authSession.tokens?.idToken?.payload?.exp) {
        addLog(`ID Token expiration: ${new Date(authSession.tokens.idToken.payload.exp * 1000).toLocaleString()}`);
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
      setError(err.message);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Flex direction="column" padding="2rem" gap="1rem">
      <Heading level={2}>Authentication Test Page</Heading>
      
      <Button onClick={checkAuth} variation="primary" isLoading={loading}>
        Refresh Auth Status
      </Button>
      
      {error && (
        <Card variation="elevated" backgroundColor="#ffeeee" padding="1rem">
          <Heading level={4} color="red">Authentication Error</Heading>
          <Text>{error}</Text>
        </Card>
      )}
      
      {user && (
        <Card variation="elevated" padding="1rem">
          <Heading level={3}>User Information</Heading>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>
      )}
      
      {session && (
        <Card variation="elevated" padding="1rem">
          <Heading level={3}>Session Information</Heading>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(session, null, 2)}
          </pre>
        </Card>
      )}
      
      <Divider />
      
      <Card variation="elevated" padding="1rem" backgroundColor="#f5f5f5">
        <Heading level={4}>Authentication Logs</Heading>
        <div style={{ maxHeight: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9em' }}>
          {logMsg.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
          {loading && <div><Loader size="small" /> Working...</div>}
        </div>
      </Card>
      
      <Button 
        onClick={() => window.location.href = '/'}
        variation="link"
      >
        Return Home
      </Button>
    </Flex>
  );
}
