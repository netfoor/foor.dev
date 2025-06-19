'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';
import { View, Flex, Text } from '@aws-amplify/ui-react';
import { User } from 'lucide-react';
import Image from 'next/image';

/**
 * Componente para mostrar la información del usuario autenticado
 * Versión modernizada para el admin panel
 */
export function UserProfile() {
  const { user, userAttributes, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  const { mode } = useTheme();
  
  if (isLoading) {
    return (
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
        }}
      >
        <View
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: mode === 'dark' ? 'rgba(75, 85, 99, 0.6)' : 'rgba(229, 231, 235, 0.6)',
            animation: 'pulse 2s infinite'
          }}
        />
        <View style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <View
            style={{
              width: '80px',
              height: '14px',
              borderRadius: '4px',
              backgroundColor: mode === 'dark' ? 'rgba(75, 85, 99, 0.6)' : 'rgba(229, 231, 235, 0.6)',
              animation: 'pulse 2s infinite'
            }}
          />
          <View
            style={{
              width: '120px',
              height: '12px',
              borderRadius: '4px',
              backgroundColor: mode === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.4)',
              animation: 'pulse 2s infinite'
            }}
          />
        </View>
      </View>
    );
  }
  
  if (!user || !userAttributes) {
    return null;
  }
  
  // Extraer información del usuario
  const name = userAttributes.name || userAttributes.givenName || t('default_username');
  const email = userAttributes.email || '';
  
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderRadius: '12px',
        backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease'
      }}
    >
      <View
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: mode === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {userAttributes.picture ? (
          <Image
            src={userAttributes.picture}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <User 
            size={20} 
            style={{ 
              color: mode === 'dark' ? '#94A3B8' : '#6B7280' 
            }} 
          />
        )}
      </View>
      <View style={{ display: 'flex', flexDirection: 'column' }}>
        <Text
          fontSize="0.875rem"
          fontWeight="600"
          style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            lineHeight: '1.2'
          }}
        >
          {name}
        </Text>
        <Text
          fontSize="0.75rem"
          style={{
            color: mode === 'dark' ? '#94A3B8' : '#64748B',
            lineHeight: '1.2'
          }}
        >
          {email}
        </Text>
      </View>
    </View>
  );
}
