'use client';

import { Card, View, Heading, Text, Flex, Link } from '@aws-amplify/ui-react';
import { Recognition } from './types';
import { formatRecognitionDate } from '../../../utils/data-loader/recognitionLoader';

interface RecognitionCardProps {
  recognition: Recognition;
}

export default function RecognitionCard({ recognition }: RecognitionCardProps) {
  return (
    <Card
      variation="outlined"
      className="recognition-card"
      style={{
        background: 'rgba(var(--amplify-colors-background-primary-rgb), 0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(var(--amplify-colors-border-primary-rgb), 0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        height: 'fit-content',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle star decoration */}
      <View
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '20px',
          height: '20px',
          opacity: 0.3,
        }}
      >
        ⭐
      </View>

      <Flex direction="column" gap="1rem">
        {/* Recognition Title */}
        <Heading
          level={3}
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--amplify-colors-font-primary)',
            lineHeight: 1.3,
            marginBottom: '0.5rem',
          }}
        >
          {recognition.title}
        </Heading>

        {/* Issuer */}
        <Text
          style={{
            color: 'var(--amplify-colors-primary-80)',
            fontSize: '0.95rem',
            fontWeight: 500,
            marginBottom: '0.25rem',
          }}
        >
          {recognition.issuer}
        </Text>

        {/* Date */}
        <Text
          style={{
            color: 'var(--amplify-colors-font-tertiary)',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
          }}
        >
          {formatRecognitionDate(recognition.issueDate)}
        </Text>

        {/* Description */}
        <Text
          style={{
            color: 'var(--amplify-colors-font-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            marginBottom: '1rem',
          }}
        >
          {recognition.description}
        </Text>

        {/* Links */}
        <Flex direction="column" gap="0.5rem">
          {recognition.issuerUrl && (
            <Link
              href={recognition.issuerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--amplify-colors-primary-80)',
                fontSize: '0.875rem',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View Issuer →
            </Link>
          )}
          
          {recognition.credentialId && (
            <Text
              style={{
                color: 'var(--amplify-colors-font-tertiary)',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
              }}
            >
              ID: {recognition.credentialId}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}
