'use client';

import React from 'react';
import { 
  Card, 
  Image, 
  Text, 
  Button, 
  Flex, 
  Heading, 
  View, 
  useTheme 
} from '@aws-amplify/ui-react';
import { CertificationCardProps } from './types';

const CertificationCard: React.FC<CertificationCardProps> = ({
  title,
  issuer,
  issueDate,
  badgeImageUrl,
  skills,
  credentialUrl,
}) => {
  const { tokens } = useTheme();

  // Format issue date for better readability
  const formattedIssueDate = `Issued: ${new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })}`;

  const handleViewCredential = () => {
    window.open(credentialUrl, '_blank', 'noopener noreferrer');
  };
  return (
    <Card
      variation="elevated"
      padding={tokens.space.medium}
      borderRadius={tokens.radii.medium}
      backgroundColor={tokens.colors.background.primary}
      height="100%"
      maxWidth="350px"
      width="100%"
    >
      <Flex direction="column" flex="1" gap={tokens.space.small}>
        {/* Issuer */}
        <Text
          fontSize={tokens.fontSizes.xs}
          color={tokens.colors.font.secondary}
          fontWeight={tokens.fontWeights.semibold}
          textTransform="uppercase"
          letterSpacing="0.05em"
        >
          {issuer}
        </Text>

        {/* Title */}
        <Heading
          level={4}
          fontSize={tokens.fontSizes.large}
          color={tokens.colors.font.primary}
          lineHeight={tokens.lineHeights.medium}
          minHeight="3em"
          marginBottom={tokens.space.xs}
        >
          {title}
        </Heading>

        {/* Issue Date */}
        <Text
          fontSize={tokens.fontSizes.small}
          color={tokens.colors.font.secondary}
          marginBottom={tokens.space.medium}
        >
          {formattedIssueDate}
        </Text>        {/* Badge Image */}
        <Flex
          width="100%"
          height="180px"
          justifyContent="center"
          alignItems="center"
          marginBottom={tokens.space.medium}
          backgroundColor={tokens.colors.background.secondary}
          borderRadius={tokens.radii.small}
          style={{ overflow: 'hidden' }}
        >
          {badgeImageUrl ? (
            <Image
              src={badgeImageUrl}
              alt={`${title} certification badge`}
              maxWidth="100%"
              maxHeight="100%"
              objectFit="contain"
            />
          ) : (
            <Text
              fontSize={tokens.fontSizes.small}
              color={tokens.colors.font.tertiary}
            >
              No Badge Available            </Text>
          )}
        </Flex>

        {/* Skills */}
        <Flex direction="column" gap={tokens.space.xs} flex="1">
          {skills.slice(0, 3).map((skill, index) => (
            <Flex key={index} alignItems="center" gap={tokens.space.xs}>
              <View
                width="6px"
                height="6px"
                borderRadius="50%"
                backgroundColor="var(--amplify-colors-primary-80)"
              />
              <Text
                fontSize={tokens.fontSizes.small}
                color={tokens.colors.font.primary}
              >
                {skill}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>      {/* Action Button */}
      <Button
        variation="primary"
        size="small"
        width="100%"
        marginTop={tokens.space.medium}
        onClick={handleViewCredential}
        backgroundColor="var(--amplify-colors-primary-80)"
        className="certification-button"
      >
        View Credential
      </Button>
    </Card>
  );
};

export default CertificationCard;
