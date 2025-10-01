'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  compact?: boolean;
}

/**
 * Botón para cerrar sesión - Versión modernizada para admin panel
 */
export function LogoutButton({
  className = '',
  variant = 'secondary',
  fullWidth = false,
  compact = false,
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();
  const { t } = useTranslation('auth');
  const { mode } = useTheme();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: compact ? '0.375rem' : '0.5rem',
      padding: compact ? '0.5rem 0.875rem' : '0.625rem 1rem',
      borderRadius: '10px',
      fontSize: compact ? '0.875rem' : '0.875rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: 'none',
      width: fullWidth ? '100%' : 'auto',
      whiteSpace: 'nowrap' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: mode === 'dark' ? '#EF4444' : '#DC2626',
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: mode === 'dark' ? '#EF4444' : '#DC2626',
          border: `2px solid ${mode === 'dark' ? '#EF4444' : '#DC2626'}`,
        };
      default: // secondary
        return {
          ...baseStyles,
          backgroundColor: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          color: mode === 'dark' ? '#EF4444' : '#DC2626',
          border: `1px solid ${mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
        };
    }
  };

  return (
    <button
      style={getButtonStyles()}
      onClick={handleLogout}
      disabled={isLoading}
      className={`hover:scale-105 active:scale-95 ${className}`}
      onMouseEnter={(e) => {
        const target = e.target as HTMLElement;
        if (variant === 'primary') {
          target.style.backgroundColor = mode === 'dark' ? '#DC2626' : '#B91C1C';
        } else if (variant === 'outline') {
          target.style.backgroundColor = mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)';
        } else {
          target.style.backgroundColor = mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        const target = e.target as HTMLElement;
        const styles = getButtonStyles();
        target.style.backgroundColor = styles.backgroundColor;
      }}
    >
      {isLoading ? (
        <>
          <Loader2 size={compact ? 16 : 18} className="animate-spin" />
          {!compact && t('loading_state')}
        </>
      ) : (
        <>
          <LogOut size={compact ? 16 : 18} />
          {!compact && t('logout')}
        </>
      )}
    </button>
  );
}
