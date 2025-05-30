import React from 'react';
import { Card, Flex, Text, Heading } from '@aws-amplify/ui-react';
import { SoftSkill } from './types';

interface SoftSkillCardProps {
  softSkill: SoftSkill;
}

export const SoftSkillCard: React.FC<SoftSkillCardProps> = ({ softSkill }) => {
  return (
    <Card 
      variation="elevated"
      className="soft-skill-card"
      backgroundColor="var(--amplify-colors-background-secondary)"
      borderRadius="medium"
      padding="large"
    >
      <Flex
        direction="column"
        gap="medium"
      >
        <Flex
          alignItems="center"
          gap="small"
        >
          <Text fontSize="xl">{softSkill.icon}</Text>
          <Heading 
            level={4}
            fontSize="large"
            fontWeight="semibold"
            color="var(--amplify-colors-font-primary)"
          >
            {softSkill.name}
          </Heading>
        </Flex>
        
        <Text
          fontSize="medium"
          color="var(--amplify-colors-font-secondary)"
          lineHeight="1.5"
        >
          {softSkill.description}
        </Text>
        
        <Flex
          padding="small"
          backgroundColor="var(--amplify-colors-primary-10)"
          borderRadius="small"
          style={{ borderLeft: "4px solid var(--amplify-colors-primary-80)" }}
        >
          <Text
            fontSize="small"
            fontStyle="italic"
            color="var(--amplify-colors-font-secondary)"
          >
            <strong>Example:</strong> {softSkill.example}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
};
