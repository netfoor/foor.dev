'use client';

import { View, Heading, Text, Flex, Button } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import RecognitionCard from './RecognitionCard';
import { getRecentRecognitions } from '../../../utils/data-loader/recognitionLoader';
import type { Recognition } from './types';

export default function RecognitionsSection() {
  const router = useRouter();
  const recognitions = getRecentRecognitions(3);

  const handleViewAll = () => {
    router.push('/recognitions');
  };

  return (
    <View as="section" padding="4rem 0">
      <Flex direction="column" gap="3rem">
        {/* Section Header */}
        <View style={{ textAlign: 'center' }}>
          <Heading
            level={2}
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            Recognition & Awards
          </Heading>
          
          <Text
            style={{
              color: 'var(--amplify-colors-font-secondary)',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Awards and recognitions that highlight excellence in technology innovation and leadership.
          </Text>
        </View>

        {/* Recognition Cards */}
        <View
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
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

        {/* View All Button */}
        <View style={{ textAlign: 'center' }}>
          <Button
            variation="primary"
            size="large"
            onClick={handleViewAll}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            View All Recognition
          </Button>
        </View>
      </Flex>
    </View>
  );
}
