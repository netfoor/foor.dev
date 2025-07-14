'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Button, Badge, Loader, Alert, Heading } from '@aws-amplify/ui-react';
import { 
  Code, 
  ArrowRight
} from 'lucide-react';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import { useAuth } from '@/context/auth-context';
import { loadSkillsFromAmplify } from '@/lib/skills/skillsLoader';

// Types for skills
type Skill = Schema["Skills"]["type"];

interface CoreSkillsSectionProps {
  className?: string;
}

const CoreSkillsSection: React.FC<CoreSkillsSectionProps> = ({ 
  className = '' 
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillImages, setSkillImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

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
      
      // Get only core skills
      const sortedSkills = await loadSkillsFromAmplify({ onlyCore: true });
      
      if (sortedSkills) {
        setSkills(sortedSkills);
        
        // Load image URLs for each skill
        const imageUrls: { [key: string]: string } = {};
        
        for (const skill of sortedSkills) {
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

  return (
    <View
      as="section"
      padding="4rem 2rem"
      className={`${className}`}
      style={{
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
            ? `radial-gradient(circle at 75% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 75% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <View maxWidth="1200px" margin="0 auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Flex direction="column" alignItems="center" gap="1.5rem" marginBottom="2rem">
          {/* Title */}
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
            {t('skills.core_title') || "Core"}{' '}
            <span style={{ 
              backgroundImage: mode === 'dark'
                ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                : 'linear-gradient(135deg, #2563EB, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('skills.core_titleHighlight') || "Skills"}
            </span>
          </Text>
          
          {/* Description */}
          <Text
            fontSize={{ base: '1rem', medium: '1.125rem' }}
            textAlign="center"
            maxWidth="600px"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
              lineHeight: 1.6,
            }}
          >
            {t('skills.core_description') || "The technologies I specialize in and use most frequently in my projects."}
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
              {t('skills.no_core_skills_found') || "No core skills found"}
            </Text>
          </Flex>
        ) : (
          <>
            {/* Skills Grid */}
            <Flex
              direction="row"
              wrap="wrap"
              justifyContent="center"
              style={{ 
                padding: '0.5rem 0 2rem 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '1.5rem',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              {skills.map((skill) => (
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
                    width: '80px', 
                    height: '80px',
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

            {/* "View All Skills" button */}
            <Flex justifyContent="center" marginTop="2rem">
              <Button
                as="a"
                href={getLocalizedPath('/skills')}
                size="large"
                style={{
                  backgroundColor: 'transparent',
                  color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                  border: mode === 'dark' 
                    ? '2px solid #93C5FD' 
                    : '2px solid #3B82F6',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  padding: '12px 24px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                className="hover:scale-105"
              >
                {t('skills.view_all_skills')}
              </Button>
            </Flex>
          </>
        )}
      </View>
    </View>
  );
};

export default CoreSkillsSection;
