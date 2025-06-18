'use client';

import { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

export default function DebugJWTTokens() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkTokens = async () => {
    setIsChecking(true);
    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      
      if (tokens?.idToken) {
        // Decode the JWT token to see the groups
        const idTokenPayload = tokens.idToken.payload;
        console.log('🔍 JWT ID Token Payload:', idTokenPayload);
        
        const userGroups = idTokenPayload['cognito:groups'] || [];
        console.log('🏷️ Groups in JWT token:', userGroups);
        
        setTokenInfo({
          sub: idTokenPayload.sub,
          email: idTokenPayload.email,
          groups: userGroups,
          tokenExpiry: idTokenPayload.exp ? new Date(idTokenPayload.exp * 1000).toLocaleString() : 'N/A',
          issuedAt: idTokenPayload.iat ? new Date(idTokenPayload.iat * 1000).toLocaleString() : 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching auth session:', error);
      setTokenInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
        Debug JWT Tokens
      </h3>
      <p className="text-blue-700 dark:text-blue-300 mb-4">
        This will decode your current JWT token to see what groups are actually included.
      </p>
      
      <button
        onClick={checkTokens}
        disabled={isChecking}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isChecking
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isChecking ? 'Checking Tokens...' : 'Check Current JWT Tokens'}
      </button>

      {tokenInfo && (
        <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-800">
          <h4 className="font-semibold mb-2">Current Token Information:</h4>
          {tokenInfo.error ? (
            <pre className="text-red-600 text-sm">{tokenInfo.error}</pre>
          ) : (
            <div className="space-y-2 text-sm">
              <div><strong>User ID:</strong> {tokenInfo.sub}</div>
              <div><strong>Email:</strong> {tokenInfo.email}</div>
              <div><strong>Groups in Token:</strong> {tokenInfo.groups?.length > 0 ? tokenInfo.groups.join(', ') : 'None'}</div>
              <div><strong>Token Expires:</strong> {tokenInfo.tokenExpiry}</div>
              <div><strong>Token Issued:</strong> {tokenInfo.issuedAt}</div>
              
              {!tokenInfo.groups?.includes('ADMINS') && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                  ⚠️ <strong>Problem Found:</strong> ADMINS group is not in your current JWT token. 
                  You need to logout and login again to get a fresh token with updated groups.
                </div>
              )}
              
              {tokenInfo.groups?.includes('ADMINS') && (
                <div className="mt-3 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  ✅ <strong>Good:</strong> ADMINS group is present in your JWT token.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
