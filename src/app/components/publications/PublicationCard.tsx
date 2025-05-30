'use client';

import { Card, View, Heading, Text, Badge, Button, Flex, Image } from '@aws-amplify/ui-react';
import { SocialPublication } from './types';
import { formatPublicationDate } from '../../../utils/data-loader/publicationLoader';

interface PublicationCardProps {
  publication: SocialPublication;
  variant?: 'carousel' | 'grid';
}

export default function PublicationCard({ publication, variant = 'carousel' }: PublicationCardProps) {
  const handleViewPublication = () => {
    if (publication.publicationUrl && publication.publicationUrl !== 'URL_DE_LA_PUBLICACION_1' && publication.publicationUrl !== 'URL_DE_LA_PUBLICACION_2' && publication.publicationUrl !== 'URL_DE_LA_PUBLICACION_3' && publication.publicationUrl !== 'URL_DE_LA_PUBLICACION_4') {
      window.open(publication.publicationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isCarousel = variant === 'carousel';

  return (
    <Card
      variation="outlined"
      className="publication-card"
      style={{
        minWidth: isCarousel ? '320px' : 'auto',
        maxWidth: isCarousel ? '400px' : 'none',
        height: isCarousel ? '480px' : 'auto',
        background: 'linear-gradient(135deg, rgba(var(--amplify-colors-background-primary-rgb), 0.95) 0%, rgba(var(--amplify-colors-background-secondary-rgb), 0.85) 100%)',
        border: '1px solid rgba(var(--amplify-colors-border-primary-rgb), 0.3)',
        borderRadius: '16px',
        padding: '0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={handleViewPublication}
    >
      {/* Featured Image Placeholder */}
      <View
        style={{
          height: '200px',
          background: 'linear-gradient(135deg, var(--amplify-colors-primary-80) 0%, var(--amplify-colors-primary-90) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Media Icon */}
        <View
          style={{
            fontSize: '3rem',
            opacity: 0.8,
            color: 'white',
          }}
        >
          📺
        </View>

        {/* Platform Badge */}
        <Badge
          variation="info"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--amplify-colors-font-primary)',
            fontWeight: 500,
          }}
        >
          {publication.platform}
        </Badge>

        {/* Type Badge */}
        <Badge
          variation="success"
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            color: 'var(--amplify-colors-font-primary)',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          {publication.type}
        </Badge>
      </View>

      {/* Content */}
      <Flex direction="column" gap="1rem" style={{ padding: '1.5rem', flex: 1 }}>
        {/* Source */}
        <Text
          style={{
            color: 'var(--amplify-colors-primary-80)',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {publication.source}
        </Text>

        {/* Title */}
        <Heading
          level={4}
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--amplify-colors-font-primary)',
            lineHeight: 1.4,
            marginBottom: '0.5rem',
          }}
        >
          {publication.title}
        </Heading>

        {/* Description */}
        <Text
          style={{
            color: 'var(--amplify-colors-font-secondary)',
            fontSize: '0.925rem',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {publication.description}
        </Text>

        {/* Footer */}
        <Flex direction="column" gap="0.75rem" style={{ marginTop: 'auto' }}>
          {/* Date */}
          <Text
            style={{
              color: 'var(--amplify-colors-font-tertiary)',
              fontSize: '0.8rem',
            }}
          >
            {formatPublicationDate(publication.publicationDate)}
          </Text>

          {/* View Button */}
          <Button
            variation="primary"
            size="small"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              borderRadius: '8px',
              fontWeight: 500,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewPublication();
            }}
          >
            View Publication →
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
