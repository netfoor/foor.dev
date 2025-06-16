'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n/client';
import Image from 'next/image';

/**
 * Componente para mostrar la información del usuario autenticado
 */
export function UserProfile() {
  const { user, userAttributes, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  
  if (isLoading) {
    return (
      <div className="rounded-lg p-4 flex items-center space-x-3 bg-gray-50 animate-pulse">
        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
        <div className="flex flex-col space-y-1">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!user || !userAttributes) {
    return null;
  }
  
  // Extraer información del usuario
  const name = userAttributes.name || userAttributes.givenName || t('default_username');
  const email = userAttributes.email || '';
  
  return (
    <div className="rounded-lg p-4 flex items-center space-x-3 bg-gray-50">
      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
        {userAttributes.picture ? (
          <Image
            src={userAttributes.picture}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{name}</span>
        <span className="text-sm text-gray-500">{email}</span>
      </div>
    </div>
  );
}
