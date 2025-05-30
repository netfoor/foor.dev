'use client';

import React from 'react';
import { View, Flex, Text, Heading, Button, Divider } from '@aws-amplify/ui-react';
import Container from './Container';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { label: 'About', href: '/about' },
      { label: 'Skills', href: '/skills' },
      { label: 'Projects', href: '/projects' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Recognitions', href: '/recognitions' },
      { label: 'Publications', href: '/publications' }
    ],
    social: [
      { 
        label: 'LinkedIn', 
        href: 'https://linkedin.com/in/fortino-romero',
        icon: '💼'
      },
      { 
        label: 'GitHub', 
        href: 'https://github.com/foor',
        icon: '💻'
      },
      { 
        label: 'AWS Community', 
        href: 'https://aws.amazon.com/developer/community/community-builders/',
        icon: '☁️'
      },
      { 
        label: 'Email', 
        href: 'mailto:fortino.romero@example.com',
        icon: '📧'
      }
    ]
  };

  return (
    <View
      as="footer"
      backgroundColor="var(--amplify-colors-background-secondary)"
      style={{ borderTop: '1px solid var(--amplify-colors-border-primary)' }}
      padding="3rem 0 2rem 0"
      marginTop="auto"
    >
      <Container>
        <Flex
          direction="column"
          gap="2rem"
        >
          {/* Main Footer Content */}
          <Flex
            direction={{ base: 'column', large: 'row' }}
            gap="2rem"
            justifyContent="space-between"
          >
            {/* Brand Section */}
            <Flex
              direction="column"
              gap="medium"
              flex="1"
              maxWidth={{ base: '100%', large: '350px' }}
            >
              <Heading 
                level={3}
                fontSize="xl"
                fontWeight="bold"
                color="var(--amplify-colors-font-primary)"
              >
                Fortino Romero
              </Heading>
              <Text
                fontSize="medium"
                color="var(--amplify-colors-font-secondary)"
                lineHeight="1.6"
              >
                Software Engineering Student passionate about cloud technologies, 
                community building, and creating meaningful social impact through technology.
              </Text>
              <Text
                fontSize="small"
                color="var(--amplify-colors-primary-80)"
                fontWeight="medium"
              >
                📍 San Pablo del Monte, Tlaxcala, Mexico
              </Text>
            </Flex>

            {/* Navigation Links */}
            <Flex
              direction="column"
              gap="medium"
              flex="1"
              maxWidth={{ base: '100%', large: '200px' }}
            >
              <Heading 
                level={4}
                fontSize="large"
                fontWeight="semibold"
                color="var(--amplify-colors-font-primary)"
              >
                Navigation
              </Heading>
              <Flex
                direction="column"
                gap="small"
              >
                {footerLinks.navigation.map((link, index) => (
                  <Button
                    key={index}
                    variation="link"
                    size="small"
                    as="a"
                    href={link.href}
                    textAlign="left"
                    justifyContent="flex-start"
                    padding="xs"
                    color="var(--amplify-colors-font-secondary)"
                    className="footer-link"
                  >
                    {link.label}
                  </Button>
                ))}
              </Flex>
            </Flex>

            {/* Social & Contact */}
            <Flex
              direction="column"
              gap="medium"
              flex="1"
              maxWidth={{ base: '100%', large: '250px' }}
            >
              <Heading 
                level={4}
                fontSize="large"
                fontWeight="semibold"
                color="var(--amplify-colors-font-primary)"
              >
                Connect
              </Heading>
              <Flex
                direction="column"
                gap="small"
              >
                {footerLinks.social.map((link, index) => (
                  <Button
                    key={index}
                    variation="link"
                    size="small"
                    as="a"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    textAlign="left"
                    justifyContent="flex-start"
                    padding="xs"
                    color="var(--amplify-colors-font-secondary)"
                    className="footer-link"
                  >
                    <Flex alignItems="center" gap="xs">
                      <Text fontSize="small">{link.icon}</Text>
                      <Text fontSize="small">{link.label}</Text>
                    </Flex>
                  </Button>
                ))}
              </Flex>
            </Flex>
          </Flex>

          <Divider orientation="horizontal" />

          {/* Bottom Footer */}
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            gap="medium"
          >
            <Text
              fontSize="small"
              color="var(--amplify-colors-font-secondary)"
              textAlign={{ base: 'center', medium: 'left' }}
            >
              © {currentYear} Fortino Romero Mantilla. Built with AWS Amplify & Next.js
            </Text>
            
            <Flex
              gap="medium"
              alignItems="center"
            >
              <Text
                fontSize="xs"
                color="var(--amplify-colors-font-tertiary)"
              >
                Made with ❤️ for the tech community
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </View>
  );
};
