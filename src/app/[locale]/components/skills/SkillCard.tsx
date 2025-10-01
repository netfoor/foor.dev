'use client';

import React from 'react';
import { Card, Flex, Text, Badge } from '@aws-amplify/ui-react';
import { Skill } from './types';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <>
      <style jsx global>{`
        .skill-icon {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 4px;
        }
      `}</style>
      <Card
        variation="outlined"
        padding="medium"
        borderRadius="medium"
        width={{ base: '100%', small: 'calc(50% - 0.5rem)', medium: 'calc(33.33% - 0.67rem)', large: 'calc(25% - 0.75rem)' }}
      >
        <Flex direction="column" gap="small">
          <Flex alignItems="center" gap="small">
            {skill.iconUrl && (
              <OptimizedImage 
                s3Key={skill.iconUrl} 
                alt={skill.name} 
                className="skill-icon"
              />
            )}
            <Text fontWeight="bold" fontSize="medium">
              {skill.name}
            </Text>
          </Flex>
        
          {skill.description && (
            <Text fontSize="small" color="font.tertiary">
              {skill.description}
            </Text>
          )}
        
          <Flex justifyContent="space-between" alignItems="center" marginTop="xs">
            <Badge variation={getProficiencyColor(skill.proficiency) as any}>
              {skill.proficiency}
            </Badge>
          
            {skill.yearsOfExperience && (
              <Text fontSize="small" color="font.secondary">
                {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </>
  );
};
