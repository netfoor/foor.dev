'use client';

import { useState } from 'react';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function DebugUserPermissions() {
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const checkUserPermissions = async () => {
    setIsChecking(true);
    setDebugInfo('');

    try {
      console.log('=== CHECKING USER PERMISSIONS ===');
      
      // Get current user
      const user = await getCurrentUser();
      console.log('Current user:', user);
      
      // Get user attributes
      const attributes = await fetchUserAttributes();
      console.log('User attributes:', attributes);
      
      // Try to read projects (should work for everyone)
      console.log('Testing READ permissions...');
      const readResult = await client.models.Projects.list();
      console.log('Read result:', readResult);
      
      // Try to create a test project (should only work for ADMINS)
      console.log('Testing CREATE permissions...');
      const testProject = {
        title: "TEST PROJECT - DELETE ME",
        description: "This is a test project to check permissions",
        place: "Test Environment",
        categories: "Personal" as const,
        status: "Draft" as const,
        featured: false
      };
      
      const createResult = await client.models.Projects.create(testProject);
      console.log('Create result:', createResult);
      
      if (createResult.data) {
        // If creation succeeded, try to delete it
        console.log('CREATE succeeded! Cleaning up test project...');
        const deleteResult = await client.models.Projects.delete({ id: createResult.data.id });
        console.log('Delete result:', deleteResult);
      }
      
      setDebugInfo(`
✅ PERMISSIONS CHECK COMPLETE:
- User ID: ${user.userId}
- Username: ${user.username}
- Email: ${attributes.email || 'N/A'}
- READ Projects: ${readResult.data ? 'SUCCESS' : 'FAILED'}
- CREATE Projects: ${createResult.data ? 'SUCCESS' : 'FAILED'}
- User Groups: Check Cognito Console for group membership

If CREATE failed with "Unauthorized", the user is not in the ADMINS group.
      `);

    } catch (error: any) {
      console.error('Permission check error:', error);
      setDebugInfo(`
❌ PERMISSION CHECK FAILED:
Error: ${error.message || error}

Common causes:
1. User not in ADMINS group in Cognito
2. Authorization rules not deployed
3. Cache issues

Check the browser console for detailed error logs.
      `);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-md border border-yellow-200 dark:border-yellow-800">
      <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-200">
        🔍 Debug User Permissions
      </h3>
      <p className="text-yellow-700 dark:text-yellow-300 mb-4">
        Use this to debug why you're getting "Unauthorized" errors. Check the console for detailed logs.
      </p>
      
      <button
        onClick={checkUserPermissions}
        disabled={isChecking}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isChecking
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }`}
      >
        {isChecking ? 'Checking Permissions...' : 'Check User Permissions'}
      </button>

      {debugInfo && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border">
          <pre className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
}
