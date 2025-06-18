'use client';

import { useState } from 'react';
import { signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export default function RefreshUserSession() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const refreshSession = async () => {
    setIsRefreshing(true);
    setMessage('');

    try {
      console.log('Logging out to refresh session...');
      
      // Cerrar sesión para limpiar cache
      await signOut();
      
      setMessage('✅ Session cleared! Please login again to get updated permissions.');
      
      // Recargar la página después de un momento
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error refreshing session:', error);
      setMessage(`❌ Error refreshing session: ${error}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
        Refresh User Permissions
      </h3>
      <p className="text-yellow-700 dark:text-yellow-300 mb-4">
        If you just added yourself to the ADMINS group in Cognito console, click this button to refresh your session and get the updated permissions.
      </p>
      
      <button
        onClick={refreshSession}
        disabled={isRefreshing}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isRefreshing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }`}
      >
        {isRefreshing ? 'Refreshing Session...' : 'Refresh Session & Logout'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
