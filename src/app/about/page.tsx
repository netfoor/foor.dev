'use client';

import React from 'react';
import { View, Flex, Heading, Text, Button, Card, Image } from '@aws-amplify/ui-react';
import Container from '../components/Container';
import { TimelineSection } from '../components/about/TimelineSection';

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="6rem 0 3rem 0"
      >
        <Container>
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            alignItems="center"
            gap="3rem"
          >
            {/* Profile Image */}
            <Flex
              justifyContent="center"
              flex="0 0 auto"
            >
              <Image
                src="/images/profile.jpeg"
                alt="Fortino Romero Mantilla"
                width="280px"
                height="280px"
                borderRadius="50%"
                objectFit="cover"
                className="profile-image"
              />
            </Flex>

            {/* Introduction Text */}
            <Flex
              direction="column"
              gap="large"
              flex="1"
            >
              <Heading 
                level={1}
                fontSize="3xl"
                fontWeight="bold"
                color="var(--amplify-colors-font-primary)"
              >
                Fortino Romero Mantilla
              </Heading>
              
              <Text
                fontSize="xl"
                color="var(--amplify-colors-primary-80)"
                fontWeight="medium"
              >
                Software Engineering Student & Cloud Technology Leader
              </Text>
              
              <Text
                fontSize="large"
                color="var(--amplify-colors-font-secondary)"
                lineHeight="1.7"
              >
                From San Pablo del Monte, Tlaxcala, pursuing Software Engineering at Universidad Tecnológica de Puebla. 
                Passionate about leveraging technology not just to solve technical problems, but to transform communities 
                and create meaningful social impact.
              </Text>

              {/* Quick Stats */}
              <Flex
                wrap="wrap"
                gap="medium"
                marginTop="medium"
              >
                <Card padding="medium" backgroundColor="var(--amplify-colors-primary-10)">
                  <Text fontSize="small" color="var(--amplify-colors-primary-80)" fontWeight="bold">🏆 Japan Representative</Text>
                </Card>
                <Card padding="medium" backgroundColor="var(--amplify-colors-primary-10)">
                  <Text fontSize="small" color="var(--amplify-colors-primary-80)" fontWeight="bold">☁️ AWS Community Builder</Text>
                </Card>
                <Card padding="medium" backgroundColor="var(--amplify-colors-primary-10)">
                  <Text fontSize="small" color="var(--amplify-colors-primary-80)" fontWeight="bold">💻 HackUTP Organizer</Text>
                </Card>
              </Flex>
            </Flex>
          </Flex>
        </Container>
      </View>

      {/* Mission & Vision */}
      <View 
        backgroundColor="var(--amplify-colors-background-secondary)"
        padding="3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            alignItems="center"
            gap="3rem"
          >
            <Heading 
              level={2}
              fontSize="2xl"
              fontWeight="bold"
              color="var(--amplify-colors-font-primary)"
              textAlign="center"
            >
              My Journey & Vision
            </Heading>

            <Flex
              direction={{ base: 'column', large: 'row' }}
              gap="2rem"
              width="100%"
            >
              {/* Mission */}
              <Card
                variation="elevated"
                padding="xl"
                backgroundColor="var(--amplify-colors-background-primary)"
                borderRadius="large"
                flex="1"
              >
                <Flex
                  direction="column"
                  gap="medium"
                >
                  <Flex alignItems="center" gap="small">
                    <Text fontSize="2xl">🎯</Text>
                    <Heading level={3} fontSize="xl" color="var(--amplify-colors-font-primary)">
                      Mission
                    </Heading>
                  </Flex>
                  <Text
                    fontSize="medium"
                    color="var(--amplify-colors-font-secondary)"
                    lineHeight="1.6"
                  >
                    My journey began with curiosity but has been built through action. From representing Mexico in Japan 
                    as the ANUIES4MX winner to founding the first AWS User Group in Puebla, I constantly seek opportunities 
                    to learn, lead, and share knowledge with others.
                  </Text>
                </Flex>
              </Card>

              {/* Vision */}
              <Card
                variation="elevated"
                padding="xl"
                backgroundColor="var(--amplify-colors-background-primary)"
                borderRadius="large"
                flex="1"
              >
                <Flex
                  direction="column"
                  gap="medium"
                >
                  <Flex alignItems="center" gap="small">
                    <Text fontSize="2xl">🚀</Text>
                    <Heading level={3} fontSize="xl" color="var(--amplify-colors-font-primary)">
                      Vision
                    </Heading>
                  </Flex>
                  <Text
                    fontSize="medium"
                    color="var(--amplify-colors-font-secondary)"
                    lineHeight="1.6"
                  >
                    I believe deeply in purposeful leadership. Beyond programming languages and tools, what drives me 
                    is connecting with people, working in teams, and designing solutions that generate real social impact. 
                    My goal is to create sustainable tech communities and scalable solutions.
                  </Text>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        </Container>
      </View>

      {/* Timeline Section */}
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            alignItems="center"
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
                Professional Journey
              </Heading>
              <Text
                fontSize="large"
                color="var(--amplify-colors-font-secondary)"
                textAlign="center"
                maxWidth="700px"
              >
                Key milestones and achievements that have shaped my path in technology and leadership.
              </Text>
            </Flex>

            <TimelineSection />
          </Flex>
        </Container>
      </View>

      {/* Leadership Philosophy */}
      <View 
        backgroundColor="var(--amplify-colors-background-secondary)"
        padding="3rem 0"
      >
        <Container>
          <Card
            variation="elevated"
            padding="xl"
            backgroundColor="var(--amplify-colors-background-primary)"
            borderRadius="large"
          >
            <Flex
              direction="column"
              alignItems="center"
              gap="large"
              textAlign="center"
            >
              <Text fontSize="3xl">💡</Text>
              <Heading 
                level={3}
                fontSize="xl"
                color="var(--amplify-colors-font-primary)"
              >
                Leadership Philosophy
              </Heading>
              <Text
                fontSize="large"
                color="var(--amplify-colors-font-secondary)"
                lineHeight="1.7"
                maxWidth="800px"
              >
                I am convinced that meaningful leadership is the next step in this journey. Not only because I share 
                the values of ethical development, social commitment, and openness, but because I want to continue 
                preparing myself to lead initiatives that improve the lives of others. I aspire to create sustainable 
                technology communities, build scalable solutions with social impact, and collaborate with other young 
                leaders to design the future we want.
              </Text>
            </Flex>
          </Card>
        </Container>
      </View>

      {/* Call to Action */}
      <View 
        backgroundColor="var(--amplify-colors-background-primary)"
        padding="3rem 0"
      >
        <Container>
          <Flex
            direction="column"
            alignItems="center"
            gap="large"
            textAlign="center"
          >
            <Heading 
              level={3}
              fontSize="xl"
              color="var(--amplify-colors-font-primary)"
            >
              Let's Connect & Collaborate
            </Heading>
            <Text
              fontSize="medium"
              color="var(--amplify-colors-font-secondary)"
              maxWidth="600px"
            >
              I'm always interested in connecting with fellow technology enthusiasts, potential collaborators, 
              and organizations working on meaningful projects. Let's build something amazing together.
            </Text>
            <Flex
              gap="medium"
              wrap="wrap"
              justifyContent="center"
            >
              <Button
                variation="primary"
                size="large"
                as="a"
                href="https://linkedin.com/in/fortino-romero"
                target="_blank"
              >
                Connect on LinkedIn
              </Button>
              <Button
                variation="link"
                size="large"
                as="a"
                href="https://github.com/foor"
                target="_blank"
              >
                View GitHub Profile
              </Button>
            </Flex>
          </Flex>
        </Container>
      </View>
    </main>
  );
}