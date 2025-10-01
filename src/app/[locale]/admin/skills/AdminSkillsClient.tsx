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
  Alert
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Tipos para Skills
type Skill = Schema["Skills"]["type"];

interface AdminSkillsClientProps {
  locale: SupportedLocale;
}

const AdminSkillsClient: React.FC<AdminSkillsClientProps> = ({ locale }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();



  // Fetch skills from Amplify Data API
  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      
      const response = await client.models.Skills.list({
        authMode: 'userPool',
      });
      
      if (response.data) {
        // Sort by priority and name
        const sortedSkills = [...response.data].sort((a, b) => {
          if (a.priority && b.priority) return a.priority - b.priority;
          if (a.priority) return -1;
          if (b.priority) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        
        setSkills(sortedSkills);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(t('skills.error_loading_skills'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm(t('skills.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(skillId);
      
      const client = generateClient<Schema>();
      
      // Get skill data to clean up icons if any (use user auth)
      const skillResponse = await client.models.Skills.get({ id: skillId }, { authMode: 'userPool' });
      const skillData = skillResponse.data;
      
      if (!skillData) {
        throw new Error(t('skills.skill_not_found'));
      }

      // Clean up icon from S3 if exists
      if (skillData.iconKey) {
        await S3Cleanup.deleteSingleFile(skillData.iconKey);
      }

      // Delete from DynamoDB with user auth and handle errors
      const deleteResult = await client.models.Skills.delete({ id: skillId }, { authMode: 'userPool' });
      if ((deleteResult as any)?.errors?.length) {
        throw new Error((deleteResult as any).errors[0].message);
      }
      
      
      // Update local state
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      
      
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError(`${t('skills.error_deleting')}: ${err instanceof Error ? err.message : t('skills.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get proficiency badge color
  const getProficiencyColor = (proficiency: string | null | undefined) => {
    switch (proficiency) {
      case 'Expert': return '#22C55E';
      case 'Advanced': return '#3B82F6';
      case 'Intermediate': return '#F59E0B';
      case 'Beginner': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Get type badge color
  const getTypeColor = (type: string | null | undefined) => {
    switch (type) {
      case 'Technical': return '#3B82F6';
      case 'Soft': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>{t('skills.loading')}</Text>
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
            {t('skills.title')}
          </Text>
          <Text
            fontSize={{ base: '0.875rem', medium: '1rem' }}
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
            }}
          >
            {t('skills.description')}
          </Text>
        </View>

        <View style={{ flexShrink: 0, width: '100%', maxWidth: '220px' }} className="md:w-auto">
          <Link href={getLocalizedPath('/admin/skills/new')} style={{ textDecoration: 'none' }}>
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
              <Text>{t('skills.create')}</Text>
            </Button>
          </Link>
        </View>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Statistics */}
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
            <Text fontSize="1.25rem" fontWeight="700" color="#3B82F6">
              {skills.filter(s => s.type === 'Technical').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('skills.technical_skills')}
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
            <Text fontSize="1.25rem" fontWeight="700" color="#8B5CF6">
              {skills.filter(s => s.type === 'Soft').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('skills.soft_skills')}
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
            <Text fontSize="1.25rem" fontWeight="700" color="#F97316">
              {skills.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('skills.total_skills')}
            </Text>
          </View>
        </Card>
      </Flex>

      {/* Skills Table */}
      <Card
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {skills.length === 0 ? (
          <View padding="3rem" textAlign="center">
            <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
              {t('skills.no_skills')}
            </Text>
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
                    {t('skills.skill_name')}
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    {t('skills.type')}
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    {t('skills.proficiency')}
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    {t('skills.experience')}
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    {t('skills.actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skills.filter(skill => skill !== null).map((skill) => (
                  <TableRow key={skill.id}>
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
                          <Zap size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        </View>
                        <View>
                          <Text 
                            fontWeight="600" 
                            style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                          >
                            {skill.name}
                          </Text>
                          <Text 
                            fontSize="0.875rem" 
                            style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                          >
                            {skill.category}
                          </Text>
                        </View>
                      </Flex>
                    </TableCell>
                    
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getTypeColor(skill.type),
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '6px',
                        }}
                      >
                        {skill.type}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {skill.proficiency && (
                        <Badge
                          style={{
                            backgroundColor: getProficiencyColor(skill.proficiency),
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '6px',
                          }}
                        >
                          {skill.proficiency}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                        {skill.yearsOfExperience ? `${skill.yearsOfExperience} years` : t('skills.not_specified')}
                      </Text>
                    </TableCell>
                    
                    <TableCell>
                      <Flex gap="0.5rem">
                        {/* Edit */}
                        <Button
                          size="small"
                          style={{
                            backgroundColor: 'transparent',
                            color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                            border: 'none',
                            padding: '0.5rem',
                          }}
                          as="a"
                          href={getLocalizedPath(`/admin/skills/${skill.id}`)}
                        >
                          <Edit3 size={16} />
                        </Button>
                        
                        {/* Delete */}
                        <Button
                          size="small"
                          style={{
                            backgroundColor: 'transparent',
                            color: mode === 'dark' ? '#F87171' : '#EF4444',
                            border: 'none',
                            padding: '0.5rem',
                          }}
                          onClick={() => handleDeleteSkill(skill.id)}
                          isDisabled={deleteLoading === skill.id}
                        >
                          {deleteLoading === skill.id ? (
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
  );
};

export default AdminSkillsClient;
