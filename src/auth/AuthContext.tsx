'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { formatUserInfo } from '../auth/cognito-helpers';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  userInfo: {
    username?: string;
    email?: string;
    name?: string;
    sub?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  userInfo: null
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();    // Listen for auth events
    const hubListenerCancel = Hub.listen('auth', ({ payload }) => {
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

  const userInfo = user ? formatUserInfo(user) : null;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user,
        userInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
