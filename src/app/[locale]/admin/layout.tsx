'use client';

import React, { useState } from 'react';
import { AuthGuardStable } from '@/app/components/auth/AuthGuardStable';
import { LogoutButton } from '@/app/components/auth/LogoutButton';
import { UserProfile } from '@/app/components/auth/UserProfile';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { View, Flex, Text, Button } from '@aws-amplify/ui-react';
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
  Settings,
  Menu,
  X
} from 'lucide-react';
import './admin.css';

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
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/projects', label: t('sections.projects'), icon: FolderOpen },
    { href: '/admin/certifications', label: t('sections.certifications'), icon: Award },
    { href: '/admin/recognitions', label: t('sections.recognitions'), icon: FileText },
    { href: '/admin/education', label: t('sections.education'), icon: GraduationCap },
    { href: '/admin/experiences', label: t('sections.experiences'), icon: Briefcase },
    { href: '/admin/languages', label: t('sections.languages'), icon: Languages },
    { href: '/admin/about/profile', label: t('users'), icon: Users },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };  return (
    <AuthGuardStable role="admin" redirectTo="/login">
      <View
        className="main-content"
        style={{
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)'
        }}
      >        {/* Admin Header - posicionado sticky dentro del contenido */}
        <View
          style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: '0', // Sticky dentro del contenido
            zIndex: 20,
            margin: '-20px -1rem 0 -1rem', // Compensar padding del contenedor
            padding: '60px 1rem 0 1rem' // Mantener el espacio interno y lateral
          }}
        >          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding={{ base: '1rem', medium: '1rem 1rem' }} // Reducido el padding lateral ya que se maneja en el contenedor
            maxWidth="100%"
          >
            {/* Mobile Menu Button + Title */}
            <Flex direction="row" alignItems="center" gap="1rem">
              {/* Hamburger Menu - Solo visible en móvil */}
              <Button
                style={{
                  display: 'block',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                  cursor: 'pointer'
                }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
              
              <Text
                fontSize={{ base: '1.25rem', medium: '1.5rem' }}
                fontWeight="700"
                style={{
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B'
                }}
              >
                {t('title')}
              </Text>
            </Flex>
              {/* User Controls */}
            <Flex direction="row" alignItems="center" gap={{ base: '0.5rem', medium: '1rem' }}>
              <View className="hidden sm:block">
                <UserProfile />
              </View>
              <LogoutButton compact={true} variant="outline" />
            </Flex>
          </Flex>        </View>        {/* Mobile Overlay */}
        {sidebarOpen && (
          <View
            style={{
              position: 'fixed',
              top: '60px', // Empezar después del NavBar principal
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 25
            }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          />
        )}        {/* Sidebar Navigation */}
        <View
          className="admin-sidebar sidebar-transition"
          style={{
            position: 'fixed',
            top: '60px', // Empezar después del NavBar principal
            left: '0',
            width: '280px',
            height: 'calc(100vh - 60px)', // Altura disponible después del NavBar
            backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            borderRight: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            backdropFilter: 'blur(20px)',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 30,
            overflowY: 'auto',
            marginTop: '18px',
          }}
        >
          {/* Mobile Header in Sidebar */}
          <View
            style={{
              padding: '1.5rem',
              borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
              display: 'block'
            }}
            className="md:hidden"
          >
            <Flex direction="row" justifyContent="space-between" alignItems="center">
              <Text
                fontSize="1.25rem"
                fontWeight="700"
                style={{
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B'
                }}
              >
                {t('title')}
              </Text>
              <Button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                  cursor: 'pointer'
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </Button>
            </Flex>
            
            {/* Mobile User Profile */}
            <View style={{ marginTop: '1rem', padding: '1rem', backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(248, 250, 252, 0.5)', borderRadius: '8px' }}>
              <UserProfile />
            </View>
          </View>

          {/* Navigation Menu */}
          <View padding={{ base: '1rem', medium: '1.5rem' }}>
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
              {t('content_management')}
            </Text>
            
            <Flex direction="column" gap="0.25rem">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={getLocalizedPath(item.href)}
                    onClick={() => setSidebarOpen(false)} // Cerrar sidebar en móvil
                    className="admin-nav-link"
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
        </View>        {/* Main Content Container */}
        <View
          className="admin-main-content admin-container"
          style={{
            padding: '1rem',
            paddingTop: '1rem', // Reducido ya que el header maneja su propio spacing
            minHeight: 'calc(100vh - 60px)', // Altura mínima después del NavBar principal
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          {children}
        </View>
      </View>
    </AuthGuardStable>
  );
}
