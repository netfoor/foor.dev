'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Button, Badge, Loader, Alert, Heading, Tabs } from '@aws-amplify/ui-react';
import { 
  Code, 
  Brain, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { loadSkillsFromAmplify } from '@/lib/skills/skillsLoader';

// Types for skills
type Skill = Schema["Skills"]["type"];

interface SkillsSectionProps {
  className?: string;
  showAll?: boolean;
  maxItems?: number;
}

interface CategoryInfo {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  className = '', 
  showAll = true, 
  maxItems = 12
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillImages, setSkillImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'technical' | 'soft'>('technical');

  const { mode } = useTheme();
  const { t } = useTranslation('homepage');
  const { isAuthenticated } = useAuth();
  const getLocalizedPath = useLocalizedPath();

  // Get image URL from S3
  const getImageUrl = async (iconKey: string | null | undefined): Promise<string | null> => {
    if (!iconKey) return null;
    
    try {
      // Normalize path - remove 'public/' if exists (for Gen 1 compatibility)
      const normalizedPath = iconKey.startsWith('public/') ? iconKey.slice(7) : iconKey;
      
      const url = await getUrl({ path: normalizedPath });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL for key:', iconKey, err);
      return null;
    }
  };

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch skills from Amplify Data API
  const fetchSkills = async () => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const sortedSkills = await loadSkillsFromAmplify();
      
      if (sortedSkills) {
        // Limit number of skills if not in showAll mode
        const limitedSkills = !showAll && sortedSkills.length > maxItems 
          ? sortedSkills.slice(0, maxItems) 
          : sortedSkills;
          
        setSkills(limitedSkills);
        
        // Load image URLs for each skill
        const imageUrls: { [key: string]: string } = {};
        
        for (const skill of limitedSkills) {
          if (skill.iconKey) {
            const imageUrl = await getImageUrl(skill.iconKey);
            if (imageUrl) {
              imageUrls[skill.id] = imageUrl;
            }
          }
        }
        
        setSkillImages(imageUrls);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(t('skills.no_skills_found'));
    } finally {
      setLoading(false);
    }
  };

  // Load skills when component mounts
  useEffect(() => {
    if (mounted) {
      fetchSkills();
    }
  }, [mounted, isAuthenticated]);

  // Categories with icons and colors
  const categoryInfo: { [key: string]: CategoryInfo } = {
    'CLOUD_PLATFORMS': { 
      name: t('skills.categories.cloud_platforms'), 
      icon: <Code size={16} />, 
      color: '#45B7D1' 
    },
    'PROGRAMMING_LANGUAGES': { 
      name: t('skills.categories.programming_languages'), 
      icon: <Code size={16} />, 
      color: '#FF6B6B' 
    },
    'FRAMEWORKS_LIBRARIES': { 
      name: t('skills.categories.frameworks_libraries'), 
      icon: <Code size={16} />, 
      color: '#4ECDC4' 
    },
    'DEVOPS_TOOLS': { 
      name: t('skills.categories.devops_tools'), 
      icon: <Code size={16} />, 
      color: '#FFEAA7' 
    },
    'DATABASES': { 
      name: t('skills.categories.databases'), 
      icon: <Code size={16} />, 
      color: '#96CEB4' 
    },
    'ARCHITECTURE_DESIGN': { 
      name: t('skills.categories.architecture_design'), 
      icon: <Code size={16} />, 
      color: '#F06292' 
    },
    'SOFT_SKILLS': { 
      name: t('skills.categories.soft_skills'), 
      icon: <Brain size={16} />, 
      color: '#9C27B0' 
    }
  };

  // Function to get proficiency color
  const getProficiencyColor = (proficiency: string | null | undefined) => {
    switch (proficiency) {
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'error';
      default: return 'neutral';
    }
  };

  if (!mounted) {
    return <div className="min-h-[400px]" />;
  }

  // Organize skills by category
  const skillsByCategory: { [key: string]: Skill[] } = {};
  
  // Initialize empty arrays for each category
  Object.keys(categoryInfo).forEach(category => {
    skillsByCategory[category] = [];
  });
  
  // Group skills by category
  skills.forEach(skill => {
    if (skill.category && skillsByCategory[skill.category]) {
      skillsByCategory[skill.category].push(skill);
    }
  });

  // Filter skills based on the active tab
  const technicalCategories = ['CLOUD_PLATFORMS', 'PROGRAMMING_LANGUAGES', 'FRAMEWORKS_LIBRARIES', 
                              'DEVOPS_TOOLS', 'DATABASES', 'ARCHITECTURE_DESIGN'];
  const softCategories = ['SOFT_SKILLS'];
  
  const relevantCategories = activeTab === 'technical' ? technicalCategories : softCategories;

  return (
    <View
      as="section"
      padding="6rem 4rem"
      className={`${className}`}
      style={{
        minHeight: '70vh',
        position: 'relative',
      }}
    >
      {/* Background Pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: mode === 'dark'
            ? `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <View maxWidth="1200px" margin="0 auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Flex direction="column" alignItems="center" gap="1.5rem" marginBottom="2rem">
          {/* Tab Selector - Modern glassmorphism style */}
          <Flex 
            direction="row" 
            alignItems="center" 
            gap="0.5rem" 
            justifyContent="center"
            marginBottom="1rem"
            style={{
              padding: '8px',
              borderRadius: '20px',
              background: mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
                : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: mode === 'dark' 
                ? '1px solid rgba(148, 163, 184, 0.2)' 
                : '1px solid rgba(203, 213, 225, 0.3)',
              boxShadow: mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
              maxWidth: '400px',
            }}
          >
            <button
              onClick={() => setActiveTab('technical')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                background: activeTab === 'technical' 
                  ? (mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)')
                  : 'transparent',
                color: activeTab === 'technical'
                  ? '#FFFFFF'
                  : (mode === 'dark' ? '#E2E8F0' : '#475569'),
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '140px',
                boxShadow: activeTab === 'technical'
                  ? (mode === 'dark' 
                    ? '0 4px 20px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
                    : '0 4px 20px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)')
                  : 'none',
                backdropFilter: activeTab === 'technical' ? 'blur(8px)' : 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'technical') {
                  e.currentTarget.style.background = mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'technical') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Code size={18} />
              {t('skills.technical')}
            </button>
            <button
              onClick={() => setActiveTab('soft')}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                background: activeTab === 'soft' 
                  ? (mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 1) 0%, rgba(37, 99, 235, 1) 100%)')
                  : 'transparent',
                color: activeTab === 'soft'
                  ? '#FFFFFF'
                  : (mode === 'dark' ? '#E2E8F0' : '#475569'),
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minWidth: '140px',
                boxShadow: activeTab === 'soft'
                  ? (mode === 'dark' 
                    ? '0 4px 20px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)'
                    : '0 4px 20px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)')
                  : 'none',
                backdropFilter: activeTab === 'soft' ? 'blur(8px)' : 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'soft') {
                  e.currentTarget.style.background = mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'soft') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Brain size={18} />
              {t('skills.soft')}
            </button>
          </Flex>

          {/* Title based on active tab */}
          <Text
            as="h2"
            fontSize={{ base: '2rem', medium: '2.5rem' }}
            fontWeight="700"
            textAlign="center"
            lineHeight="1.1"
            style={{
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #93C5FD, #60A5FA)'
                : 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
            }}
          >
            {activeTab === 'technical' ? t('skills.title') : t('skills.soft_title')}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {activeTab === 'technical' ? t('skills.titleHighlight') : t('skills.soft_titleHighlight')}
            </span>
          </Text>
          
          {/* Description based on active tab */}
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            textAlign="center"
            maxWidth="600px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {activeTab === 'technical' ? t('skills.description') : t('skills.soft_description')}
          </Text>
        </Flex>

        {/* Content */}
        {loading ? (
          <Flex direction="column" alignItems="center" gap="1rem" padding="3rem 0">
            <Loader size="large" />
            <Text style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
              {t('skills.loading')}
            </Text>
          </Flex>
        ) : error ? (
          <Alert variation="error" marginBottom="2rem">
            {error}
          </Alert>
        ) : skills.length === 0 ? (
          <Flex direction="column" alignItems="center" gap="1rem" padding="3rem 0">
            <Code size={50} style={{ color: mode === 'dark' ? '#64748B' : '#94A3B8' }} />
            <Text
              fontSize="1.1rem"
              fontWeight="medium"
              style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
            >
              {t('skills.no_skills_found')}
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="3rem">
            {/* Render skills by category, filtered by active tab */}
            {Object.entries(skillsByCategory)
              .filter(([category]) => relevantCategories.includes(category))
              .map(([category, categorySkills]) => 
                categorySkills.length > 0 && (
                  <View key={category}>
                    {/* Category Header */}
                    <Heading
                      level={3}
                      fontSize="1.75rem"
                      fontWeight="700"
                      marginBottom="1.5rem"
                      style={{
                        color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                        borderBottom: mode === 'dark' 
                          ? '1px solid rgba(148, 163, 184, 0.2)' 
                          : '1px solid rgba(203, 213, 225, 0.4)',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      {categoryInfo[category]?.name || category}
                    </Heading>
                  
                  {/* Skills Grid - Different layouts for technical vs soft skills */}
                  {activeTab === 'technical' ? (
                    <Flex
                      direction="row"
                      wrap="wrap"
                      justifyContent="flex-start"
                      style={{ 
                        padding: '0.5rem 0 2rem 0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      {categorySkills.map((skill) => (
                        <Flex
                          key={skill.id}
                          direction="column"
                          alignItems="center"
                          gap="0.75rem"
                          padding="1rem"
                          style={{
                            display: 'flex',
                            transition: 'all 0.3s ease',
                            cursor: 'default',
                            height: '100%'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Skill Icon */}
                          <div style={{ 
                            width: '70px', 
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: '12px',
                            backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(248, 250, 252, 0.8)',
                            padding: '12px',
                            boxShadow: mode === 'dark' 
                              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                          }}>
                            {skill.iconKey && skillImages[skill.id] ? (
                              <img
                                src={skillImages[skill.id]}
                                alt={skill.name || 'Skill icon'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Code size={40} color={mode === 'dark' ? '#60A5FA' : '#3B82F6'} />
                            )}
                          </div>
                          
                          {/* Skill Name */}
                          <Text
                            fontWeight="medium"
                            fontSize="0.9rem"
                            textAlign="center"
                            style={{ 
                              color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                              lineHeight: '1.2',
                              maxWidth: '100%',
                              height: '2.5rem', // Fixed height for consistent layout
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 4px'
                            }}
                          >
                            {skill.name}
                          </Text>
                          
                          {/* Skill Proficiency (optional) */}
                          {skill.proficiency && (
                            <Badge 
                              variation={getProficiencyColor(skill.proficiency) as any}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                fontWeight: '500'
                              }}
                            >
                              {skill.proficiency}
                            </Badge>
                          )}
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    // Soft Skills layout - Card based with descriptions
                    <Flex
                      direction="column"
                      gap="1.5rem"
                      style={{ 
                        padding: '0.5rem 0 2rem 0',
                      }}
                    >
                      {categorySkills.map((skill) => (
                        <View
                          key={skill.id}
                          backgroundColor={mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.8)'}
                          borderRadius="16px"
                          padding="1.5rem"
                          style={{
                            border: mode === 'dark' 
                              ? '1px solid rgba(148, 163, 184, 0.1)' 
                              : '1px solid rgba(203, 213, 225, 0.2)',
                            boxShadow: mode === 'dark'
                              ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Flex direction={{ base: 'column', medium: 'row' }} gap="1.5rem" alignItems="flex-start">
                            {/* Skill Icon and Name */}
                            <Flex direction="column" alignItems="center" gap="1rem" style={{ minWidth: '100px' }}>
                              <div style={{ 
                                width: '80px', 
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                borderRadius: '50%',
                                backgroundColor: mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                                padding: '12px',
                              }}>
                                {skill.iconKey && skillImages[skill.id] ? (
                                  <img
                                    src={skillImages[skill.id]}
                                    alt={skill.name || 'Skill icon'}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain',
                                    }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Brain size={40} color={mode === 'dark' ? '#C084FC' : '#8B5CF6'} />
                                )}
                              </div>
                              
                              <Text
                                fontWeight="semibold"
                                fontSize="1.1rem"
                                textAlign="center"
                                style={{ 
                                  color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
                                }}
                              >
                                {skill.name}
                              </Text>
                              
                              {skill.proficiency && (
                                <Badge 
                                  variation={getProficiencyColor(skill.proficiency) as any}
                                  style={{
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '10px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {skill.proficiency}
                                </Badge>
                              )}
                            </Flex>
                            
                            {/* Skill Description */}
                            <Flex direction="column" gap="0.75rem" flex="1">
                              <Text
                                fontSize="1rem"
                                style={{ 
                                  color: mode === 'dark' ? '#CBD5E1' : '#64748B',
                                  lineHeight: '1.6',
                                }}
                              >
                                {skill.description || 
                                  "This is where I would provide specific examples of how I've applied this soft skill in professional settings, including specific scenarios, outcomes, and lessons learned."}
                              </Text>
                              
                              {skill.examples && (
                                <Text
                                  fontSize="0.9rem"
                                  fontStyle="italic"
                                  style={{ 
                                    color: mode === 'dark' ? '#94A3B8' : '#475569',
                                  }}
                                >
                                  <strong>Example:</strong> {skill.examples}
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        </View>
                      ))}
                    </Flex>
                  )}
                </View>
              )
            )}
          </Flex>
        )}

        {/* "View All Skills" button when not in showAll mode */}
        {!showAll && skills.length > 0 && (
          <Flex justifyContent="center" marginTop="3rem">
            <Button
              as="a"
              href={getLocalizedPath('/skills')}
              size="large"
              variation="primary"
              style={{
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                padding: '1rem 2rem',
                backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {t('skills.view_all_skills')}
              <ArrowRight size={20} />
            </Button>
          </Flex>
        )}
      </View>
    </View>
  );
};

export default SkillsSection;
