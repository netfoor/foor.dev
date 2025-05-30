import React, { useEffect, useState } from 'react';
import { View, Flex, Heading, Text, Button } from '@aws-amplify/ui-react';
import Container from '../Container';
import { SkillCard } from './SkillCard';
import { loadSkillsData } from './skillsLoader';
import { Skill } from './types';

export const SkillsSection: React.FC = () => {
  const [coreSkills, setCoreSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await loadSkillsData();
        setCoreSkills(skillsData.Skills.coreTechnologies);
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="3rem 0"
      >
        <Container>
          <Text>Loading skills...</Text>
        </Container>
      </View>
    );
  }

  return (
    <View 
      backgroundColor="var(--amplify-colors-background-primary)"
      padding="3rem 0"
    >
      <Container>
        <Flex
          direction="column"
          gap="2rem"
        >
          {/* Header */}
          <Flex
            direction="column"
            alignItems="center"
            gap="medium"
          >
            <Heading 
              level={2}
              fontSize="2xl"
              fontWeight="bold"
              color="var(--amplify-colors-font-primary)"
              textAlign="center"
            >
              Core Technologies
            </Heading>
            <Text
              fontSize="large"
              color="var(--amplify-colors-font-secondary)"
              textAlign="center"
              maxWidth="600px"
            >
              Here are my signature technologies that I use to build scalable, 
              cloud-native solutions and drive digital transformation.
            </Text>
          </Flex>

          {/* Core Skills Grid */}
          <Flex
            className="skills-grid"
            wrap="wrap"
            gap="medium"
            justifyContent="center"
          >
            {coreSkills.map((skill, index) => (
              <SkillCard key={`${skill.name}-${index}`} skill={skill} />
            ))}
          </Flex>

          {/* Call to Action */}
          <Flex
            justifyContent="center"
            marginTop="large"
          >
            <Button
              variation="primary"
              size="large"
              as="a"
              href="/skills"
            >
              View All Skills & Expertise
            </Button>
          </Flex>
        </Flex>
      </Container>
    </View>
  );
};
