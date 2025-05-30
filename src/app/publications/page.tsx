'use client';

import { View, Heading, Text, Flex, Button } from '@aws-amplify/ui-react';
import Container from '../components/Container';
import PublicationCard from '../components/publications/PublicationCard';
import { loadSocialPublications, getPublicationsByType } from '../../utils/data-loader/publicationLoader';
import type { SocialPublication } from '../components/publications/types';
import { useState } from 'react';

export default function PublicationsPage() {
  const allPublications = loadSocialPublications();
  const publicationsByType = getPublicationsByType();
  const publicationTypes = Object.keys(publicationsByType);
  const [activeTab, setActiveTab] = useState(publicationTypes.length > 0 ? publicationTypes[0] : 'all');

  const getCurrentPublications = () => {
    if (activeTab === 'all') {
      return allPublications;
    }
    return publicationsByType[activeTab] || [];
  };

  const tabs = [
    { value: 'all', label: 'All Publications', count: allPublications.length },
    ...publicationTypes.map(type => ({
      value: type,
      label: type,
      count: publicationsByType[type].length
    }))
  ];

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
              Media Publications
            </Heading>
            
            <Text
              style={{
                color: 'var(--amplify-colors-font-secondary)',
                fontSize: '1.25rem',
                lineHeight: 1.6,
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              A comprehensive collection of media features, academic publications, and institutional recognition 
              showcasing contributions to technology innovation and academic excellence.
            </Text>
          </View>          {/* Publications Content */}
          {/* Custom Tab Navigation */}
          <Flex
            justifyContent="center"
            marginBottom="3rem"
            gap="0.75rem"
            wrap="wrap"
            style={{ maxWidth: '1400px', margin: '0 auto 3rem' }}
          >
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variation={activeTab === tab.value ? 'primary' : 'link'}
                onClick={() => setActiveTab(tab.value)}
                backgroundColor={activeTab === tab.value ? 'var(--amplify-colors-primary-80)' : undefined}
                style={{
                  fontSize: '1rem',
                  fontWeight: activeTab === tab.value ? '600' : '400',
                }}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </Flex>

          {/* Publications Display */}
          <View style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            <Text
              style={{
                color: 'var(--amplify-colors-font-secondary)',
                fontSize: '1rem',
                marginBottom: '2rem',
                textAlign: 'center',
              }}
            >
              {getCurrentPublications().length} publication{getCurrentPublications().length !== 1 ? 's' : ''} 
              {activeTab === 'all' ? ' total' : ` in ${activeTab}`}
            </Text>
            
            {getCurrentPublications().length > 0 ? (
              <View
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '2rem',
                  width: '100%',
                }}
              >
                {getCurrentPublications().map((publication: SocialPublication, index: number) => (
                  <PublicationCard
                    key={`${publication.title}-${index}`}
                    publication={publication}
                    variant="grid"
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
                  No publications found.
                </Text>
              </View>
            )}
          </View>
        </Flex>
      </View>
    </Container>
  );
}
