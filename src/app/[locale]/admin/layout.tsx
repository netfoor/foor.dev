'use client';

import React from 'react';
import { AuthGuardStable } from '@/app/components/auth/AuthGuardStable';
import { LogoutButton } from '@/app/components/auth/LogoutButton';
import { UserProfile } from '@/app/components/auth/UserProfile';
import { useTheme } from '@/hooks/useTheme';
import { View, Flex, Text } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Award, 
  GraduationCap, 
  Languages, 
  Briefcase, 
  FileText, 
  Settings 
} from 'lucide-react';

/**
 * Layout para la sección de administración
 * Diseño cohesivo con el resto de la aplicación
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mode } = useTheme();
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/projects', label: 'Proyectos', icon: FolderOpen },
    { href: '/admin/certifications', label: 'Certificaciones', icon: Award },
    { href: '/admin/education', label: 'Educación', icon: GraduationCap },
    { href: '/admin/experiences', label: 'Experiencias', icon: Briefcase },
    { href: '/admin/languages', label: 'Idiomas', icon: Languages },
    { href: '/admin/recognitions', label: 'Reconocimientos', icon: Award },
    { href: '/admin/publications', label: 'Publicaciones', icon: FileText },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <AuthGuardStable role="admin" redirectTo="/login">
      <View
        style={{
          minHeight: 'calc(100vh - 4rem)',
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)'
        }}
      >
        {/* Header del Admin */}
        <View
          style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: '4rem',
            zIndex: 10
          }}
        >
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding="1rem 2rem"
            maxWidth="100%"
          >
            <Text
              fontSize="1.5rem"
              fontWeight="700"
              style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B'
              }}
            >
              Panel de Administración
            </Text>
            
            <Flex direction="row" alignItems="center" gap="1rem">
              <UserProfile />
              <LogoutButton />
            </Flex>
          </Flex>
        </View>

        <Flex direction="row" width="100%">
          {/* Sidebar Navigation */}
          <View
            style={{
              width: '280px',
              backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderRight: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
              minHeight: 'calc(100vh - 8rem)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <View padding="1.5rem">
              <Text
                fontSize="0.875rem"
                fontWeight="600"
                style={{
                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem'
                }}
              >
                Gestión de Contenido
              </Text>
              
              <Flex direction="column" gap="0.25rem">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        textDecoration: 'none',
                        display: 'block',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: active 
                          ? (mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                          : 'transparent',
                        color: active
                          ? (mode === 'dark' ? '#93C5FD' : '#2563EB')
                          : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
                        fontSize: '0.875rem',
                        fontWeight: active ? '600' : '500',
                        transition: 'all 0.2s ease',
                        borderLeft: active ? `3px solid ${mode === 'dark' ? '#3B82F6' : '#2563EB'}` : '3px solid transparent'
                      }}
                    >
                      <Flex direction="row" alignItems="center" gap="0.75rem">
                        <Icon size={18} />
                        {item.label}
                      </Flex>
                    </Link>
                  );
                })}
              </Flex>
            </View>
          </View>

          {/* Main Content */}
          <View
            style={{
              flex: 1,
              padding: '2rem',
              minHeight: 'calc(100vh - 8rem)'
            }}
          >
            {children}
          </View>
        </Flex>
      </View>
    </AuthGuardStable>
  );
}
