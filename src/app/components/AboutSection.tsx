'use client';

import { View, Flex, Heading, Text, Card, useTheme } from '@aws-amplify/ui-react';
import Container from './Container';

export default function AboutSection() {
  const { tokens } = useTheme();
  
  return (
    <View 
      id="about" 
      position="relative" 
      paddingBlock={{ base: '1.5rem', medium: '1rem' }}
    >
      {/* Background blur layers */}
      <View
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginLeft: '-13rem',
          opacity: 0.4,
          filter: 'blur(106px)',
        }}
        className="dark:opacity-20"
      >
        <View
          height="14rem"
          style={{
            background: 'linear-gradient(to bottom right, var(--amplify-colors-primary-80), #a855f7)',
            filter: 'blur(106px)',
          }}
          className="dark:bg-gradient-to-br dark:from-blue-700"
        />
        <View
          height="8rem"
          style={{
            background: 'linear-gradient(to right, #22d3ee, #7dd3fc)',
            filter: 'blur(106px)',
          }}
          className="dark:to-indigo-600"
        />
      </View>

      <Container>
        <View position="relative">
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            gap={{ base: '2.5rem', medium: '4rem' }}
          >
            {/* Left column */}
            <View flex={{ medium: '7' }}>
              <Heading
                level={2}
                fontSize="1.875rem"
                fontWeight="bold"
                color={tokens.colors.font.primary}
                marginBottom="2rem"
              >
                Who am <Text as="span" color="primary.80">I?</Text>
              </Heading>

              <Flex direction="column" gap="1.5rem">
                <Text
                  color={tokens.colors.font.secondary}
                  lineHeight="1.625"
                >
                  I'm a software engineering student and passionate Cloud Engineer-in-training from Mexico. I specialize in designing cloud-native solutions with AWS, Docker, and IoT, and I believe in using technology to solve real-world challenges.
                </Text>
                <Text
                  color={tokens.colors.font.secondary}
                  lineHeight="1.625"
                >
                  From hackathons to international innovation programs, I thrive in collaborative environments where impact meets creativity. I currently lead the AWS User Group Puebla and have delivered tech talks about my work in Japan and beyond.
                </Text>
                <View
                  paddingLeft="1rem"
                  marginBlock="2rem"
                  style={{
                    borderLeft: `4px solid var(--amplify-colors-primary-80)`,
                    fontStyle: 'italic',
                  }}
                >
                  <Text
                    color={tokens.colors.font.secondary}
                    fontStyle="italic"
                  >
                    "I aim to build scalable, impactful tech that serves both people and planet."
                  </Text>
                </View>
              </Flex>
            </View>

            {/* Right column - Highlights */}
            <View flex={{ medium: '5' }}>
              <Card
                padding="1.5rem"
                borderRadius="1rem"
                backgroundColor={tokens.colors.background.primary}
                boxShadow="0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
              >
                <Heading
                  level={3}
                  fontSize="1.25rem"
                  fontWeight="600"
                  color={tokens.colors.font.primary}
                  marginBottom="1.5rem"
                >
                  Highlights
                </Heading>
                <Flex direction="column" gap="1rem">
                  <Flex alignItems="flex-start">
                    <Text fontSize="1.5rem" marginRight="1rem">🇯🇵</Text>
                    <View>
                      <Text
                        color={tokens.colors.font.primary}
                        fontWeight="500"
                      >
                        Intern at Mirai Innovation, Osaka
                      </Text>
                      <Text color={tokens.colors.font.secondary}>
                        Cloud flood monitoring system
                      </Text>
                    </View>
                  </Flex>
                  <Flex alignItems="flex-start">
                    <Text fontSize="1.5rem" marginRight="1rem">🏆</Text>
                    <View>
                      <Text
                        color={tokens.colors.font.primary}
                        fontWeight="500"
                      >
                        Winner
                      </Text>
                      <Text color={tokens.colors.font.secondary}>
                        ANUIES4MX National Innovation Challenge
                      </Text>
                    </View>
                  </Flex>
                  <Flex alignItems="flex-start">
                    <Text fontSize="1.5rem" marginRight="1rem">🌍</Text>
                    <View>
                      <Text
                        color={tokens.colors.font.primary}
                        fontWeight="500"
                      >
                        Community Leader
                      </Text>
                      <Text color={tokens.colors.font.secondary}>
                        Hackathon UTP Organizer & AWS UG Puebla
                      </Text>
                    </View>
                  </Flex>
                  <Flex alignItems="flex-start">
                    <Text fontSize="1.5rem" marginRight="1rem">💬</Text>
                    <View>
                      <Text
                        color={tokens.colors.font.primary}
                        fontWeight="500"
                      >
                        Speaker
                      </Text>
                      <Text color={tokens.colors.font.secondary}>
                        Talks on international experience and cloud technology
                      </Text>
                    </View>
                  </Flex>
                  <Flex alignItems="flex-start">
                    <Text fontSize="1.5rem" marginRight="1rem">📖</Text>
                    <View>
                      <Text
                        color={tokens.colors.font.primary}
                        fontWeight="500"
                      >
                        Published
                      </Text>
                      <Text color={tokens.colors.font.secondary}>
                        In UTP academic media
                      </Text>
                    </View>
                  </Flex>
                </Flex>
              </Card>
            </View>
          </Flex>
        </View>
      </Container>
    </View>
  );
}
