'use client';

import React, { useState } from 'react';
import { Card, Flex, Text, Heading, Button, Divider } from '@aws-amplify/ui-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SoftSkill } from './types';
import { OptimizedImage } from '@/components/optimitation/OptimizedImage';

interface SoftSkillCardProps {
  softSkill: SoftSkill;
}

export const SoftSkillCard: React.FC<SoftSkillCardProps> = ({ softSkill }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <style jsx global>{`
        .softskill-icon {
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
        width={{ base: '100%', medium: 'calc(50% - 0.5rem)', large: 'calc(33.33% - 0.67rem)' }}
      >
        <Flex direction="column" gap="medium">
          <Flex alignItems="center" gap="small">
            {softSkill.iconUrl && (
              <OptimizedImage 
                s3Key={softSkill.iconUrl} 
                alt={softSkill.name} 
                className="softskill-icon"
              />
            )}
            <Heading level={4} fontWeight="semibold" fontSize="medium">
              {softSkill.name}
            </Heading>
          </Flex>
        
          {softSkill.description && (
            <Text fontSize="small" color="font.secondary">
              {softSkill.description}
            </Text>
          )}
        
          {((softSkill.examples?.length ?? 0) > 0 || (softSkill.achievements?.length ?? 0) > 0) && (
            <>
              <Button 
                onClick={toggleExpanded}
                variation="link"
                padding="0"
                color="font.primary"
                fontWeight="normal"
                textAlign="left"
              >
                <Flex alignItems="center" gap="xxs">
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <Text fontSize="small">
                    {expanded ? 'Show less' : 'Show examples'}
                  </Text>
                </Flex>
              </Button>
            
              {expanded && (
                <Flex direction="column" gap="small">
                  {softSkill.examples && softSkill.examples.length > 0 && (
                    <div>
                      <Text fontWeight="semibold" fontSize="small">Examples:</Text>
                      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                        {softSkill.examples.map((example, index) => (
                          <li key={index}>
                            <Text fontSize="small" color="font.secondary">
                              {example}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                
                  {softSkill.achievements && softSkill.achievements.length > 0 && (
                    <div>
                      <Text fontWeight="semibold" fontSize="small">Achievements:</Text>
                      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                        {softSkill.achievements.map((achievement, index) => (
                          <li key={index}>
                            <Text fontSize="small" color="font.secondary">
                              {achievement}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Flex>
              )}
            </>
          )}
        </Flex>
      </Card>
    </>
  );
};
