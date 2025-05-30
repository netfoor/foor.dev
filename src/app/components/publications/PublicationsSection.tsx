'use client';

import { View, Heading, Text, Flex, Button, Collection, ScrollView } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import PublicationCard from './PublicationCard';
import { getFeaturedPublications } from '../../../utils/data-loader/publicationLoader';
import type { SocialPublication } from './types';

export default function PublicationsSection() {
  const router = useRouter();
  const featuredPublications = getFeaturedPublications(5);

  const handleViewAll = () => {
    router.push('/publications');
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
            Media Publications
          </Heading>
          
          <Text
            style={{
              color: 'var(--amplify-colors-font-secondary)',
              fontSize: '1.125rem',
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: '700px',
              margin: '0 auto',
              marginBottom: '1rem',
            }}
          >
            My work and contributions have been featured in academic publications and media by institutions such as ANUIES, Mirai Innovation and Universidad Tecnológica de Puebla.
          </Text>

          {/* Scroll hint */}
          <Text
            style={{
              color: 'var(--amplify-colors-font-tertiary)',
              fontSize: '0.925rem',
              fontStyle: 'italic',
            }}
          >
            ← Scroll horizontally to explore publications →
          </Text>
        </View>

        {/* Publications Carousel */}
        <View style={{ position: 'relative' }}>          <ScrollView
            orientation="horizontal"
            className="publications-carousel"
            style={{
              padding: '1rem 0',
              overflow: 'auto',
            }}
          >
            <Collection
              items={featuredPublications}
              type="list"
              direction="row"
              gap="1.5rem"
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: '0 2rem',
                minWidth: 'max-content',
              }}
            >
              {(publication: SocialPublication, index: number) => (
                <PublicationCard
                  key={`${publication.title}-${index}`}
                  publication={publication}
                  variant="carousel"
                />
              )}
            </Collection>
          </ScrollView>

          {/* Gradient overlays for scroll indication */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '50px',
              background: 'linear-gradient(to right, var(--amplify-colors-background-primary), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '50px',
              background: 'linear-gradient(to left, var(--amplify-colors-background-primary), transparent)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
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
            View All Publications
          </Button>
        </View>
      </Flex>
    </View>
  );
}
