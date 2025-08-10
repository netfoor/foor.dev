'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Badge, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Loader,
  Alert,
  Menu,
  MenuItem,
  Divider
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  User,
  Briefcase,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Tipos para Profile y Experience
type Profile = Schema["Profile"]["type"];
type Experience = Schema["Experiences"]["type"];

interface AdminAboutClientProps {
  locale: SupportedLocale;
}

const AdminAboutClient: React.FC<AdminAboutClientProps> = ({ locale }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();

  // Fetch profile and experiences from Amplify Data API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      // Fetch profile (should be only one)
      const profileResponse = await client.models.Profile.list({
        authMode: 'userPool', // Usar autenticación de usuario
      });
      
      if (profileResponse.data && profileResponse.data.length > 0) {
        setProfile(profileResponse.data[0]);
      }
      
      // Fetch experiences
      const experiencesResponse = await client.models.Experiences.list({
        authMode: 'userPool', // Usar autenticación de usuario
      });
      
      if (experiencesResponse.data) {
        // Filtrar nulls y ordenar por fecha de inicio (más reciente primero)
        const sortedExperiences = experiencesResponse.data
          .filter(exp => exp !== null && exp.startDate)
          .sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        setExperiences(sortedExperiences);
      }
    } catch (err) {
      console.error('Error fetching about data:', err);
      setError(t('about.error_loading_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Eliminar experiencia completa (DynamoDB + S3)
  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm(t('about.confirm_delete_experience'))) {
      return;
    }

    try {
      setDeleteLoading(experienceId);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      // 1. PRIMERO: Obtener los datos de la experiencia para acceder a la clave de S3
      const experienceResponse = await client.models.Experiences.get({ id: experienceId });
      const experienceData = experienceResponse.data;
      
      if (!experienceData) {
        throw new Error(t('about.experience_not_found'));
      }

      // 2. SEGUNDO: Eliminar archivo de S3 si existe
      if (experienceData.photoKey) {
        await S3Cleanup.deleteSingleFile(experienceData.photoKey);
      }

      // 3. TERCERO: Eliminar el registro de DynamoDB
      await client.models.Experiences.delete({
        id: experienceId
      });
      
      console.log(`✅ Experiencia ${experienceId} eliminada completamente de DynamoDB`);
      
      // 4. CUARTO: Actualizar la lista local
      setExperiences(prev => prev.filter(exp => exp.id !== experienceId));
      
      // Mensaje de éxito
      console.log(`🎉 Experiencia eliminada exitosamente: ${experienceData.company}`);
      
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError(`${t('about.error_deleting_experience')}: ${err instanceof Error ? err.message : t('about.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Eliminar perfil completo (DynamoDB + S3)
  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm(t('about.confirm_delete_profile'))) {
      return;
    }

    try {
      setDeleteLoading(profileId);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      // 1. PRIMERO: Obtener los datos del perfil para acceder a la clave de S3
      const profileResponse = await client.models.Profile.get({ id: profileId });
      const profileData = profileResponse.data;
      
      if (!profileData) {
        throw new Error(t('about.profile_not_found'));
      }

      // 2. SEGUNDO: Eliminar archivo de S3 si existe
      if (profileData.profilePhotoKey) {
        await S3Cleanup.deleteSingleFile(profileData.profilePhotoKey);
      }

      // 3. TERCERO: Eliminar el registro de DynamoDB
      await client.models.Profile.delete({
        id: profileId
      });
      
      console.log(`✅ Perfil ${profileId} eliminado completamente de DynamoDB`);
      
      // 4. CUARTO: Actualizar el estado local
      setProfile(null);
      
      // Mensaje de éxito
      console.log(`🎉 Perfil eliminado exitosamente: ${profileData.name}`);
      
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError(`${t('about.error_deleting_profile')}: ${err instanceof Error ? err.message : t('about.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Función para determinar si una experiencia es actual
  const isCurrentPosition = (experience: Experience | null) => {
    if (!experience) return false;
    return !experience.endDate || experience.endDate === null;
  };

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>{t('common.loading_profile')}</Text>
      </Flex>
    );
  }

  return (
    <View>
      {/* Header */}
      <Flex
        direction={{ base: 'column', medium: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ base: 'stretch', medium: 'flex-start' }}
        gap="1rem"
        marginBottom="2rem"
        style={{ width: '100%' }}
      >
        <View style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Text
            fontSize={{ base: '1.5rem', medium: '2rem' }}
            fontWeight="700"
            style={{
              color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            }}
          >
            {t('about.title')}
          </Text>
          <Text
            fontSize={{ base: '0.875rem', medium: '1rem' }}
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
            }}
          >
            {t('sections.manage_about')}
          </Text>
        </View>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Tab Navigation */}
      <Flex 
        direction="row" 
        gap="1rem" 
        marginBottom="2rem"
        style={{
          borderBottom: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid rgba(203, 213, 225, 0.3)',
          paddingBottom: '1rem'
        }}
      >
        <Button
          variation={activeTab === 'profile' ? 'primary' : 'link'}
          onClick={() => setActiveTab('profile')}
          size="small"
          style={{
            backgroundColor: activeTab === 'profile' 
              ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
              : 'transparent',
            color: activeTab === 'profile'
              ? '#FFFFFF'
              : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <User size={16} />
          {t('about.profile.title')}
        </Button>
        <Button
          variation={activeTab === 'experiences' ? 'primary' : 'link'}
          onClick={() => setActiveTab('experiences')}
          size="small"
          style={{
            backgroundColor: activeTab === 'experiences' 
              ? (mode === 'dark' ? '#3B82F6' : '#2563EB')
              : 'transparent',
            color: activeTab === 'experiences'
              ? '#FFFFFF'
              : (mode === 'dark' ? '#CBD5E1' : '#64748B'),
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Briefcase size={16} />
          {t('about.experiences.title')}
        </Button>
      </Flex>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <View>
          {/* Profile Header */}
          <Flex
            direction={{ base: 'column', medium: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ base: 'stretch', medium: 'flex-start' }}
            gap="1rem"
            marginBottom="2rem"
            style={{ width: '100%' }}
          >
            <View style={{ flex: '1 1 auto', minWidth: 0 }}>
              <Text
                fontSize={{ base: '1.25rem', medium: '1.5rem' }}
                fontWeight="600"
                style={{
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                }}
              >
                {t('about.profile.manage')}
              </Text>
            </View>

            <View style={{ flexShrink: 0, width: '100%', maxWidth: '220px' }} className="md:w-auto">
              <Link href={getLocalizedPath(`/admin/about/profile/${profile?.id ? profile.id : 'new'}`)} style={{ textDecoration: 'none' }}>
                <Button
                  variation="primary"
                  size="large"
                  style={{
                    backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    width: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {profile ? <Edit3 size={20} /> : <Plus size={20} />}
                  <Text className="hidden sm:inline">{profile ? t('about.edit') : t('about.create')}</Text>
                  <Text className="sm:hidden">{profile ? t('about.edit') : t('about.create')}</Text>
                </Button>
              </Link>
            </View>
          </Flex>

          {/* Estadísticas del Perfil */}
          <Flex 
            direction={{ base: 'column', medium: 'row' }} 
            gap="1.5rem" 
            marginBottom="2rem"
            style={{
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <Card
              style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '100%',
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              <View padding="1rem">
                <Text fontSize="1.25rem" fontWeight="700" color={profile ? '#22C55E' : '#F59E0B'}>
                  {profile ? '1' : '0'}
                </Text>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {t('about.total_profiles')}
                </Text>
              </View>
            </Card>

            <Card
              style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '100%',
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              <View padding="1rem">
                <Text fontSize="1.25rem" fontWeight="700" color={profile?.isActive ? '#22C55E' : '#6B7280'}>
                  {profile?.isActive ? '1' : '0'}
                </Text>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {t('about.active_profiles')}
                </Text>
              </View>
            </Card>
          </Flex>

          {/* Profile Card */}
          <Card
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {profile ? (
              <View padding="2rem">
                <Flex alignItems="center" gap="1.5rem">
                  <View
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={40} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <View>
                    <Text 
                      fontSize="1.5rem"
                      fontWeight="600" 
                      style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                    >
                      {profile.name}
                    </Text>
                    <Text 
                      fontSize="1rem" 
                      style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                    >
                      {profile.currentPosition}
                    </Text>
                    {profile.isActive && (
                      <Badge
                        style={{
                          backgroundColor: '#22C55E',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '6px',
                          marginTop: '0.5rem'
                        }}
                      >
                        {t('common.active')}
                      </Badge>
                    )}
                  </View>
                </Flex>
                {profile.description && (
                  <Text 
                    fontSize="0.875rem" 
                    style={{ 
                      color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                      marginTop: '1rem',
                      lineHeight: '1.5'
                    }}
                  >
                    {profile.description}
                  </Text>
                )}
                
                {/* Profile Actions */}
                <Flex 
                  justifyContent="space-between" 
                  alignItems="center" 
                  style={{ marginTop: '1.5rem' }}
                >
                  <Flex gap="0.5rem">
                    {/* Editar */}
                    <Button
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                        border: 'none',
                        padding: '0.5rem',
                      }}
                      as="a"
                      href={getLocalizedPath(`/admin/about/profile/${profile.id}`)}
                    >
                      <Edit3 size={16} />
                    </Button>
                    
                    {/* Eliminar */}
                    <Button
                      size="small"
                      style={{
                        backgroundColor: 'transparent',
                        color: mode === 'dark' ? '#F87171' : '#EF4444',
                        border: 'none',
                        padding: '0.5rem',
                      }}
                      onClick={() => handleDeleteProfile(profile.id)}
                      isDisabled={deleteLoading === profile.id}
                    >
                      {deleteLoading === profile.id ? (
                        <Loader size="small" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </View>
            ) : (
              <View padding="3rem" textAlign="center">
                <User size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: mode === 'dark' ? '#9CA3AF' : '#6B7280' }} />
                <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
                  {t('about.no_profiles_yet')}
                </Text>
                <Link href={getLocalizedPath('/admin/about/profile/new')} style={{ textDecoration: 'none' }}>
                  <Button
                    variation="primary"
                    style={{
                      backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: '0 auto'
                    }}
                  >
                    <Plus size={16} />
                    {t('about.create')}
                  </Button>
                </Link>
              </View>
            )}
          </Card>
        </View>
      )}

      {activeTab === 'experiences' && (
        <View>
          {/* Experiences Header */}
          <Flex
            direction={{ base: 'column', medium: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ base: 'stretch', medium: 'flex-start' }}
            gap="1rem"
            marginBottom="2rem"
            style={{ width: '100%' }}
          >
            <View style={{ flex: '1 1 auto', minWidth: 0 }}>
              <Text
                fontSize={{ base: '1.25rem', medium: '1.5rem' }}
                fontWeight="600"
                style={{
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                }}
              >
                {t('about.experiences.manage')}
              </Text>
            </View>

            <View style={{ flexShrink: 0, width: '100%', maxWidth: '220px' }} className="md:w-auto">
              <Link href={getLocalizedPath('/admin/about/experiences/new')} style={{ textDecoration: 'none' }}>
                <Button
                  variation="primary"
                  size="large"
                  style={{
                    backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    width: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus size={20} />
                  <Text className="hidden sm:inline">{t('about.create')}</Text>
                  <Text className="sm:hidden">{t('about.create')}</Text>
                </Button>
              </Link>
            </View>
          </Flex>

          {/* Estadísticas de Experiencias */}
          <Flex 
            direction={{ base: 'column', medium: 'row' }} 
            gap="1.5rem" 
            marginBottom="2rem"
            style={{
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <Card
              style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '100%',
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              <View padding="1rem">
                <Text fontSize="1.25rem" fontWeight="700" color="#22C55E">
                  {experiences.filter(exp => exp && isCurrentPosition(exp)).length}
                </Text>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {t('about.experiences.current_positions')}
                </Text>
              </View>
            </Card>

            <Card
              style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '100%',
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              <View padding="1rem">
                <Text fontSize="1.25rem" fontWeight="700" color="#3B82F6">
                  {experiences.length}
                </Text>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {t('about.experiences.total_experiences')}
                </Text>
              </View>
            </Card>
            
            <Card
              style={{
                flex: 1,
                minWidth: '160px',
                maxWidth: '100%',
                backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
                boxSizing: 'border-box'
              }}
            >
              <View padding="1rem">
                <Text fontSize="1.25rem" fontWeight="700" color="#F59E0B">
                  {new Set(experiences.map(exp => exp.company)).size}
                </Text>
                <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                  {t('about.experiences.companies')}
                </Text>
              </View>
            </Card>
          </Flex>

          {/* Tabla de experiencias */}
          <Card
            style={{
              backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {experiences.length === 0 ? (
              <View padding="3rem" textAlign="center">
                <Briefcase size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: mode === 'dark' ? '#9CA3AF' : '#6B7280' }} />
                <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
                  {t('about.no_experiences_yet')}
                </Text>
                <Link href={getLocalizedPath('/admin/about/experiences/new')} style={{ textDecoration: 'none' }}>
                  <Button
                    variation="primary"
                    style={{
                      backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      margin: '0 auto'
                    }}
                  >
                    <Plus size={16} />
                    {t('about.create')}
                  </Button>
                </Link>
              </View>
            ) : (
              <View 
                className="table-container"
                style={{
                  overflowX: 'auto',
                  width: '100%'
                }}
              >
                <Table
                  style={{
                    backgroundColor: 'transparent',
                    width: '100%'
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                        {t('about.experiences.company')}
                      </TableCell>
                      <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                        {t('about.experiences.position')}
                      </TableCell>
                      <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                        {t('about.status')}
                      </TableCell>
                      <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                        {t('about.experiences.period')}
                      </TableCell>
                      <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                        {t('about.experiences.actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  {experiences.filter(experience => experience !== null).map((experience) => (
                    <TableRow key={experience.id}>
                      <TableCell>
                        <Flex alignItems="center" gap="0.75rem">
                          <View
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Briefcase size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                          </View>
                          <View>
                            <Text 
                              fontWeight="600" 
                              style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                            >
                              {experience.company}
                            </Text>
                            {experience.location && (
                              <Text 
                                fontSize="0.875rem" 
                                style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                              >
                                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                {experience.location}
                              </Text>
                            )}
                          </View>
                        </Flex>
                      </TableCell>
                      
                      <TableCell>
                        <Text 
                          fontWeight="500" 
                          style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                        >
                          {experience.position}
                        </Text>
                      </TableCell>
                      
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: isCurrentPosition(experience) ? '#22C55E' : '#6B7280',
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                          }}
                        >
                          {isCurrentPosition(experience) ? t('common.current') : t('common.previous')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Flex alignItems="center" gap="0.25rem">
                          <Calendar size={14} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                          <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                            {new Date(experience.startDate).toLocaleDateString()} - {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : t('about.present')}
                          </Text>
                        </Flex>
                      </TableCell>
                      
                      <TableCell>
                        <Flex gap="0.5rem">
                          {/* Editar */}
                          <Button
                            size="small"
                            style={{
                              backgroundColor: 'transparent',
                              color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                              border: 'none',
                              padding: '0.5rem',
                            }}
                            as="a"
                            href={getLocalizedPath(`/admin/about/experiences/${experience.id}`)}
                          >
                            <Edit3 size={16} />
                          </Button>
                          
                          {/* Eliminar */}
                          <Button
                            size="small"
                            style={{
                              backgroundColor: 'transparent',
                              color: mode === 'dark' ? '#F87171' : '#EF4444',
                              border: 'none',
                              padding: '0.5rem',
                            }}
                            onClick={() => handleDeleteExperience(experience.id)}
                            isDisabled={deleteLoading === experience.id}
                          >
                            {deleteLoading === experience.id ? (
                              <Loader size="small" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </View>
            )}
          </Card>
        </View>
      )}
    </View>
  );
};

export default AdminAboutClient;
