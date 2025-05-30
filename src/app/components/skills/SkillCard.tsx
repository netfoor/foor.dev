import React from 'react';
import { Card, Flex, Text, Image } from '@aws-amplify/ui-react';
import { Skill } from './types';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  return (
    <Card 
      variation="elevated"
      className="skill-card"
      backgroundColor="var(--amplify-colors-background-secondary)"
      borderRadius="medium"
      padding="medium"
    >
      <Flex
        direction="column"
        alignItems="center"
        gap="small"
      >
        {skill.image ? (
          <Image
            src={skill.image}
            alt={skill.name}
            width="32px"
            height="32px"
          />
        ) : (
          <Flex
            justifyContent="center"
            alignItems="center"
            width="32px"
            height="32px"
            backgroundColor="var(--amplify-colors-primary-80)"
            borderRadius="small"
          >
            <Text fontSize="small" color="white">?</Text>
          </Flex>
        )}
        <Text
          fontSize="small"
          fontWeight="medium"
          textAlign="center"
          color="var(--amplify-colors-font-primary)"
        >
          {skill.name}
        </Text>
        {skill.category && (
          <Text
            fontSize="xs"
            color="var(--amplify-colors-font-secondary)"
            textAlign="center"
          >
            {skill.category}
          </Text>
        )}
      </Flex>
    </Card>
  );
};
