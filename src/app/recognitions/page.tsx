'use client';

import { loadRecognitions } from '../../utils/data-loader/recognitionLoader';
import type { Recognition } from '../components/recognitions/types';
import { View, Heading, Text, Flex } from '@aws-amplify/ui-react';
import Container from '../components/Container';
import RecognitionCard from '../components/recognitions/RecognitionCard';


export default function RecognitionsPage() {
  const recognitions = loadRecognitions();

  return (
    <Container>
      <View as="main" padding="2rem 0 4rem">
        <Flex direction="column" gap="3rem">
          {/* Page Header */}
          <View style={{ textAlign: 'center' }}>
            <Heading
              level={1}
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, var(--amplify-colors-primary-80) 0%, var(--amplify-colors-primary-90) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Recognition & Awards
            </Heading>
            
            <Text
              style={{
                color: 'var(--amplify-colors-font-secondary)',
                fontSize: '1.25rem',
                lineHeight: 1.6,
                maxWidth: '700px',
                margin: '0 auto',
              }}
            >
              Awards, recognitions, and achievements that highlight excellence in technology innovation, 
              academic performance, and leadership in various competitions and programs.
            </Text>
          </View>

          {/* Recognition Cards */}
          {recognitions.length > 0 ? (
            <View
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
              }}
            >
              {recognitions.map((recognition: Recognition, index: number) => (
                <RecognitionCard
                  key={`${recognition.title}-${index}`}
                  recognition={recognition}
                />
              ))}
            </View>
          ) : (
            <View style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Text
                style={{
                  color: 'var(--amplify-colors-font-tertiary)',
                  fontSize: '1.125rem',
                }}
              >
                No recognitions found.
              </Text>
            </View>
          )}
        </Flex>
      </View>
    </Container>
  );
}
