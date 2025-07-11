'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';
import { View, Flex, Text, Card, Loader } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { 
  FolderOpen, 
  Award, 
  GraduationCap, 
  Briefcase, 
  Languages, 
  FileText, 
  Users,
  TrendingUp,
  Eye,
  Activity,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

/**
 * Dashboard de administración moderno y cohesivo
 * Muestra estadísticas y accesos rápidos a todas las secciones
 */
export default function AdminDashboard() {
  const { userAttributes, isAdmin } = useAuth();
  const { mode } = useTheme();
  const { t: tAdmin } = useTranslation('admin');
  const { t: tCommon } = useTranslation('common');
  const [stats, setStats] = useState({
    projects: 0,
    certifications: 0,
    education: 0,
    experiences: 0,
    languages: 0,
    recognitions: 0,
    publications: 0,
    loading: true
  });

  const name = userAttributes?.givenName || userAttributes?.name || tAdmin('administrator');

  // Obtener estadísticas de cada modelo
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const client = generateClient<Schema>();
        
        const [
          projectsResponse,
          certificationsResponse,
          educationResponse,
          experiencesResponse,
          languagesResponse,
          recognitionsResponse,
          publicationsResponse
        ] = await Promise.all([
          client.models.Projects.list({ authMode: 'userPool' }),
          client.models.Certifications.list({ authMode: 'userPool' }),
          client.models.Education.list({ authMode: 'userPool' }),
          client.models.Experiences.list({ authMode: 'userPool' }),
          client.models.Languages.list({ authMode: 'userPool' }),
          client.models.Recognitions.list({ authMode: 'userPool' }),
          client.models.SocialPublications.list({ authMode: 'userPool' })
        ]);

        setStats({
          projects: projectsResponse.data?.length || 0,
          certifications: certificationsResponse.data?.length || 0,
          education: educationResponse.data?.length || 0,
          experiences: experiencesResponse.data?.length || 0,
          languages: languagesResponse.data?.length || 0,
          recognitions: recognitionsResponse.data?.length || 0,
          publications: publicationsResponse.data?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  // Configuración de las secciones del dashboard
  const dashboardSections = [
    {
      title: tAdmin('sections.projects'),
      count: stats.projects,
      icon: FolderOpen,
      href: '/admin/projects',
      color: '#3B82F6',
      description: tAdmin('sections.manage_portfolio')
    },
    {
      title: tAdmin('sections.certifications'),
      count: stats.certifications,
      icon: Award,
      href: '/admin/certifications',
      color: '#F59E0B',
      description: tAdmin('sections.manage_certifications')
    },
    {
      title: tAdmin('sections.education'),
      count: stats.education,
      icon: GraduationCap,
      href: '/admin/education',
      color: '#10B981',
      description: tAdmin('sections.manage_education')
    },
    {
      title: tAdmin('about.profile.title'),
      count: 1, // Profile is always 1
      icon: Users,
      href: '/admin/about/profile',
      color: '#EC4899',
      description: tAdmin('sections.manage_profile')
    },
    {
      title: tAdmin('sections.experiences'),
      count: stats.experiences,
      icon: Briefcase,
      href: '/admin/about/experiences',
      color: '#8B5CF6',
      description: tAdmin('sections.manage_experiences')
    },
    {
      title: tAdmin('sections.languages'),
      count: stats.languages,
      icon: Languages,
      href: '/admin/languages',
      color: '#06B6D4',
      description: tAdmin('sections.manage_languages')
    },
    {
      title: tAdmin('sections.recognitions'),
      count: stats.recognitions,
      icon: Award,
      href: '/admin/recognitions',
      color: '#EF4444',
      description: tAdmin('sections.manage_recognitions')
    },
    {
      title: tAdmin('sections.publications'),
      count: stats.publications,
      icon: FileText,
      href: '/admin/publications',
      color: '#84CC16',
      description: tAdmin('sections.manage_publications')
    }
  ];

  // Métricas destacadas
  const highlightMetrics = [
    {
      label: tCommon('total_content'),
      value: stats.projects + stats.certifications + stats.education + stats.experiences + stats.languages + stats.recognitions + stats.publications,
      icon: Activity,
      color: '#3B82F6',
      change: '+12%'
    },
    {
      label: tCommon('active_projects'),
      value: stats.projects,
      icon: TrendingUp,
      color: '#10B981',
      change: '+8%'
    },
    {
      label: tAdmin('sections.certifications'),
      value: stats.certifications,
      icon: Award,
      color: '#F59E0B',
      change: '+15%'
    },
    {
      label: tCommon('years_experience'),
      value: '5+',
      icon: Briefcase,
      color: '#8B5CF6',
      change: tCommon('active')
    }
  ];

  if (stats.loading) {
    return (
      <View style={{ padding: '2rem', textAlign: 'center' }}>
        <Loader size="large" />
        <Text style={{ marginTop: '1rem', color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
          {tCommon('loading_dashboard')}
        </Text>
      </View>
    );
  }  return (
    <View style={{ width: '100%' }}>
      {/* Header de Bienvenida */}
      <View style={{ marginBottom: '2rem' }}>
        <Text
          fontSize={{ base: '1.875rem', medium: '2.5rem' }}
          fontWeight="700"
          style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            marginBottom: '0.5rem'
          }}
        >
          {tAdmin('welcome')}, {name} 👋
        </Text>
        <Text
          fontSize={{ base: '1rem', medium: '1.125rem' }}
          style={{
            color: mode === 'dark' ? '#94A3B8' : '#64748B'
          }}
        >
          {tAdmin('manage_portfolio')}
        </Text>
        
        {isAdmin && (
          <View
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: mode === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              border: `1px solid ${mode === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
              borderRadius: '8px',
              display: 'inline-block'
            }}
          >
            <Text
              fontSize="0.875rem"
              fontWeight="600"
              style={{ color: '#10B981' }}
            >
              ✓ {tCommon('admin_privileges_active')}
            </Text>
          </View>
        )}
      </View>      {/* Métricas Destacadas */}
      <View style={{ marginBottom: '2rem' }}>
        <Text
          fontSize="1.25rem"
          fontWeight="600"
          style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            marginBottom: '1rem'
          }}
        >
          {tCommon('general_overview')}
        </Text>
        <View 
          className="metrics-gallery"
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent'
          }}
        >
          <Flex 
            direction="row"
            gap="1rem"
            style={{
              minWidth: 'fit-content',
              paddingRight: '1rem'
            }}
          >
            {highlightMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={index}
                  className="dashboard-card"
                  style={{
                    minWidth: '280px',
                    maxWidth: '300px',
                    flexShrink: 0,
                    backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                <View padding="1.5rem">
                  <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <View
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: `${metric.color}20`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={24} style={{ color: metric.color }} />
                    </View>
                    <Text
                      fontSize="0.875rem"
                      fontWeight="600"
                      style={{
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px'
                      }}
                    >
                      {metric.change}
                    </Text>
                  </Flex>
                    <Text
                    fontSize={{ base: '1.5rem', medium: '2rem' }}
                    fontWeight="700"
                    style={{
                      color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {metric.value}                  </Text>
                  
                  <Text
                    fontSize="0.875rem"
                    style={{
                      color: mode === 'dark' ? '#94A3B8' : '#64748B'
                    }}
                  >
                    {metric.label}
                  </Text>
                </View>
              </Card>
            );
          })}
          </Flex>
        </View>
      </View>

      {/* Secciones de Gestión */}
      <View>
        <Text
          fontSize="1.25rem"
          fontWeight="600"
          style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            marginBottom: '1rem'
          }}
        >
          Gestión de Contenido
        </Text>          <div 
            className="content-management-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              width: '100%'
            }}
          >
          {dashboardSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={index}
                href={section.href}
                style={{
                  textDecoration: 'none'
                }}
              >                <Card
                  style={{
                    height: '100%',
                    backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:scale-105"
                >
                  <View padding="1.5rem">
                    <Flex direction="row" justifyContent="space-between" alignItems="flex-start" marginBottom="1rem">
                      <View
                        style={{
                          width: '56px',
                          height: '56px',
                          backgroundColor: `${section.color}20`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={28} style={{ color: section.color }} />
                      </View>
                      
                      <ArrowRight 
                        size={20} 
                        style={{ 
                          color: mode === 'dark' ? '#94A3B8' : '#64748B',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </Flex>                    <Text
                      fontSize="1.5rem"
                      fontWeight="700"
                      style={{
                        color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {section.title}
                    </Text>
                    
                    <Text
                      fontSize="2rem"
                      fontWeight="700"
                      style={{
                        color: section.color,
                        marginBottom: '0.5rem'
                      }}
                    >
                      {section.count}
                    </Text>
                    
                    <Text
                      fontSize="0.875rem"
                      style={{
                        color: mode === 'dark' ? '#94A3B8' : '#64748B'
                      }}
                    >
                      {section.description}
                    </Text>                  </View>
                </Card>
              </Link>
            );
          })}
        </div>
      </View>

      {/* Acciones Rápidas */}
      <View style={{ marginTop: '2rem' }}>
        <Text
          fontSize="1.25rem"
          fontWeight="600"
          style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            marginBottom: '1rem'
          }}        >
          Acciones Rápidas
        </Text>
        
        <View className="quick-actions-container">          <Flex 
            direction={{ base: 'column', medium: 'row' }} 
            gap="1.5rem"
            style={{ width: '100%' }}
          >          <Link
            href="/admin/projects/new"
            style={{
              textDecoration: 'none',
              flex: '1 1 280px',
              minWidth: '280px'
            }}
          >
            <Card
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <View padding="1.5rem">
                <Flex direction="row" alignItems="center" gap="1rem">
                  <Plus size={24} style={{ color: '#3B82F6' }} />
                  <View>
                    <Text
                      fontSize="1.125rem"
                      fontWeight="600"
                      style={{ color: '#3B82F6' }}
                    >
                      Crear Nuevo Proyecto
                    </Text>
                    <Text
                      fontSize="0.875rem"
                      style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                    >
                      Añade un nuevo proyecto a tu portafolio
                    </Text>
                  </View>
                </Flex>
              </View>
            </Card>
          </Link>          <Link
            href="/"
            target="_blank"
            style={{
              textDecoration: 'none',
              flex: '1 1 280px',
              minWidth: '280px'
            }}
          >
            <Card
              style={{
                backgroundColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <View padding="1.5rem">
                <Flex direction="row" alignItems="center" gap="1rem">
                  <Globe size={24} style={{ color: '#10B981' }} />
                  <View>
                    <Text
                      fontSize="1.125rem"
                      fontWeight="600"
                      style={{ color: '#10B981' }}
                    >
                      Ver Sitio Web
                    </Text>
                    <Text
                      fontSize="0.875rem"
                      style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                    >
                      Revisa cómo se ve tu portafolio
                    </Text>
                  </View>
                </Flex>
              </View>
            </Card>          </Link>
        </Flex>
        </View>
      </View>
    </View>
  );
}
