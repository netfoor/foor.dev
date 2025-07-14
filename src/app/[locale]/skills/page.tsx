'use client';

import React, { useEffect, useState } from 'react';
import { View, Flex, Heading, Text, Divider } from '@aws-amplify/ui-react';
import Container from '@/components/ui/Container';
import { SkillCard } from '../components/skills/SkillCard';
import { SoftSkillCard } from '../components/skills/SoftSkillCard';
import { loadSkillsData, getSkillCategories } from '../components/skills/skillsLoader';
import { SkillCategory, SoftSkill } from '../components/skills/types';

export default function SkillsPage() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await loadSkillsData();
        setSkillCategories(getSkillCategories(skillsData));
        setSoftSkills(skillsData.SoftSkills);
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
      <main>
        <View 
          backgroundColor="var(--amplify-colors-background-primary)"
          padding="6rem 0 3rem 0"
        >
          <Container>
            <Text>Loading skills...</Text>
          </Container>
        </View>
      </main>
    );
  }

  return (
    <main>
      {/* Page Header */}
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="6rem 0 3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            alignItems="center"
            gap="large"
          >
            <Heading 
              level={1}
              fontSize="3xl"
              fontWeight="bold"
              color="var(--amplify-colors-font-primary)"
              textAlign="center"
            >
              Skills & Expertise
            </Heading>
            <Text
              fontSize="large"
              color="var(--amplify-colors-font-secondary)"
              textAlign="center"
              maxWidth="800px"
              lineHeight="1.6"
            >
              A comprehensive overview of my technical skills across cloud platforms, 
              development tools, and architectural patterns, plus the soft skills that 
              enable successful project delivery and team leadership.
            </Text>
          </Flex>
        </Container>
      </View>

      {/* Technical Skills */}
      <View 
        backgroundColor="var(--amplify-colors-background-secondary)"
        padding="3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            gap="3rem"
          >
            <Heading 
              level={2}
              fontSize="2xl"
              fontWeight="bold"
              color="var(--amplify-colors-font-primary)"
              textAlign="center"
            >
              Technical Skills
            </Heading>

            {skillCategories.map((category, categoryIndex) => (
              <Flex
                key={`category-${categoryIndex}`}
                direction="column"
                gap="large"
              >
                <Flex
                  alignItems="center"
                  gap="small"
                >
                  <Text fontSize="xl">{category.icon}</Text>
                  <Heading 
                    level={3}
                    fontSize="xl"
                    fontWeight="semibold"
                    color="var(--amplify-colors-font-primary)"
                  >
                    {category.name}
                  </Heading>
                </Flex>
                
                <Flex
                  className="skills-grid"
                  wrap="wrap"
                  gap="medium"
                >
                  {category.skills.map((skill, skillIndex) => (
                    <SkillCard 
                      key={`${category.name}-${skill.name}-${skillIndex}`} 
                      skill={skill} 
                    />
                  ))}
                </Flex>

                {categoryIndex < skillCategories.length - 1 && (
                  <Divider 
                    orientation="horizontal"
                    marginTop="large"
                  />
                )}
              </Flex>
            ))}
          </Flex>
        </Container>
      </View>

      {/* Soft Skills */}
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            gap="3rem"
          >
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
                Leadership & Soft Skills
              </Heading>
              <Text
                fontSize="large"
                color="var(--amplify-colors-font-secondary)"
                textAlign="center"
                maxWidth="700px"
              >
                Beyond technical expertise, these are the interpersonal and leadership 
                skills that enable me to drive successful outcomes in complex projects.
              </Text>
            </Flex>

            <Flex
              className="soft-skills-grid"
              wrap="wrap"
              gap="large"
            >
              {softSkills.map((softSkill, index) => (
                <SoftSkillCard 
                  key={`${softSkill.name}-${index}`} 
                  softSkill={softSkill} 
                />
              ))}
            </Flex>
          </Flex>
        </Container>
      </View>
    </main>
  );
}
