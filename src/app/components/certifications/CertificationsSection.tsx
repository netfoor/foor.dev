'use client';

import React from 'react';
import { 
  Flex, 
  Grid, 
  Heading, 
  Text, 
  Button, 
  View, 
  useTheme,
  Divider 
} from '@aws-amplify/ui-react';
import CertificationCard from './CertificationCard';
import Container from '../Container';
import { CertificationsSectionProps } from './types';

const CertificationsSection: React.FC<CertificationsSectionProps> = ({ 
  certifications, 
  showAll = false,
  maxDisplay = 3 
}) => {
  const { tokens } = useTheme();
  
  const displayedCertifications = showAll 
    ? certifications 
    : certifications.slice(0, maxDisplay);

  const handleSeeAll = () => {
    // Navigate to /certifications page
    window.location.href = '/certifications';
  };

  return (
    <View
      as="section"
      id="certifications"
      paddingTop={tokens.space.xxxl}
      paddingBottom={tokens.space.xxxl}
      backgroundColor={tokens.colors.background.secondary}
    >
      <Container>
        <Flex direction="column" alignItems="center" textAlign="center">
          {/* Section Header */}
          <Heading
            level={2}
            fontSize={{ base: tokens.fontSizes.xxl, large: tokens.fontSizes.xxxl }}
            color={tokens.colors.font.primary}
            marginBottom={tokens.space.xs}
            fontWeight={tokens.fontWeights.bold}
          >
            Certifications & Training
          </Heading>
          
          <Text
            fontSize={tokens.fontSizes.medium}
            color={tokens.colors.font.secondary}
            maxWidth="600px"
            marginBottom={tokens.space.medium}
            lineHeight={tokens.lineHeights.medium}
          >
            I constantly seek to improve my skills and stay up to date in emerging
            technologies through certified training and professional development.
          </Text>

          {/* Accent Divider */}
          <View
            height="3px"
            width="60px"
            backgroundColor="var(--amplify-colors-primary-80)"
            borderRadius={tokens.radii.small}
            marginBottom={tokens.space.large}
          />          {/* Certifications Grid */}
          <Grid
            templateColumns={{
              base: '1fr',
              medium: 'repeat(auto-fit, minmax(320px, 1fr))',
              large: 'repeat(3, 1fr)',
            }}
            gap={tokens.space.medium}
            width="100%"
            style={{
              justifyItems: 'center',
              alignItems: 'stretch',
            }}
          >
            {displayedCertifications.map((cert, index) => (
              <CertificationCard 
                key={cert.credentialId || `cert-${index}`} 
                {...cert} 
              />
            ))}
          </Grid>

          {/* See All Button */}
          {!showAll && certifications.length > maxDisplay && (
            <Flex direction="column" alignItems="center" marginTop={tokens.space.large}>
              <View
                height="3px"
                width="60px"
                backgroundColor="var(--amplify-colors-primary-80)"
                borderRadius={tokens.radii.small}
                marginBottom={tokens.space.medium}
              />              <Button
                variation="primary"
                size="large"
                onClick={handleSeeAll}
                backgroundColor="var(--amplify-colors-primary-80)"
                className="certification-button"
              >
                View All Certifications ({certifications.length})
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
    </View>
  );
};

export default CertificationsSection;
