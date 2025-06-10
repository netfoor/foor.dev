"use client"
import { useState, useMemo } from 'react';
import { Flex, Heading, Text, Card, Collection, Badge, Loader, View, Image, Grid } from '@aws-amplify/ui-react';
import Container from '../components/Container';
import { useAmplifyData, formatDate, getUniqueValues } from '../../utils/data-loader/common-data-hooks';

// Define the Publication type
interface Publication {
  id: string;
  title: string;
  publisher: string;
  publicationDate: string;
  type?: string;
  description?: string;
  coverImageUrl?: string;
  publicationUrl?: string;
  authors?: string[];
  tags?: string[];
}

export default function PublicationsClient() {
  const [filterType, setFilterType] = useState<string | null>(null);

  // Use our custom hook to fetch data
  const { data: publications, loading, error } = useAmplifyData<Publication>(
    'SocialPublications',
    {
      sortBy: 'publicationDate',
      sortDirection: 'desc'
    }
  );

  // Get all unique publication types for filtering
  const publicationTypes = useMemo(() => 
    getUniqueValues(publications, 'type'),
    [publications]
  );

  // Filter publications by type if a filter is selected
  const filteredPublications = useMemo(() => {
    if (!filterType) {
      return publications;
    }
    return publications.filter(pub => pub.type === filterType);
  }, [publications, filterType]);

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Text variation="error" textAlign="center" padding="2rem">
        Error loading publications: {error}
      </Text>
    );
  }

  if (publications.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No publications to display yet.
      </Text>
    );
  }

  return (
    <View className="flex flex-col min-h-screen">
      <View paddingTop="xl" paddingBottom="medium">
        <Container>
          <View textAlign="center" marginBottom="large">
            <Heading level={1} marginBottom="small">
              Publications & Media
            </Heading>
            <Text fontSize="medium" color="font.secondary" maxWidth="700px" margin="0 auto">
              Articles, research papers, and publications across academic journals, tech blogs, and media platforms.
            </Text>
          </View>
        </Container>
      </View>

      <Container>
        {/* Type Filter */}
        {publicationTypes.length > 0 && (
          <Flex 
            justifyContent="center" 
            marginBottom="large" 
            gap="small"
            wrap="wrap"
          >
            <Badge 
              onClick={() => setFilterType(null)} 
              size="large"
              backgroundColor={!filterType ? 'var(--amplify-colors-primary-80)' : undefined}
              color={!filterType ? 'white' : undefined}
              style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
            >
              All
            </Badge>
            {publicationTypes.map(type => (
              <Badge 
                key={type} 
                onClick={() => setFilterType(type)}
                size="large"
                backgroundColor={filterType === type ? 'var(--amplify-colors-primary-80)' : undefined}
                color={filterType === type ? 'white' : undefined}
                style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
              >
                {type}
              </Badge>
            ))}
          </Flex>
        )}

        {/* Publications Collection */}
        <Collection
          items={filteredPublications}
          type="list"
          gap="1.5rem"
          marginBottom="2rem"
        >
          {(publication, index) => (
            <Card key={index} variation="elevated" padding="1.5rem">
              <Flex alignItems="flex-start" gap="1.5rem" wrap={{ base: 'wrap', medium: 'nowrap' }}>
                {publication.coverImageUrl && (
                  <Image
                    src={publication.coverImageUrl}
                    alt={publication.title}
                    width={{ base: '100%', medium: '200px' }}
                    height={{ base: '200px', medium: '150px' }}
                    objectFit="cover"
                    borderRadius="medium"
                    marginBottom={{ base: '1rem', medium: '0' }}
                  />
                )}
                <Flex direction="column" flex={1}>
                  <Heading level={3}>{publication.title}</Heading>
                  
                  <Text fontWeight="bold" marginBottom="0.5rem">
                    {publication.publisher}
                    {publication.publicationDate && ` • ${formatDate(publication.publicationDate)}`}
                  </Text>
                  
                  {publication.type && (
                    <Badge 
                      variation="info" 
                      marginBottom="0.5rem"
                    >
                      {publication.type}
                    </Badge>
                  )}
                  
                  {publication.authors && publication.authors.length > 0 && (
                    <Text marginBottom="0.5rem">
                      <strong>Authors:</strong> {publication.authors.join(', ')}
                    </Text>
                  )}
                  
                  {publication.description && (
                    <Text marginBottom="1rem">{publication.description}</Text>
                  )}
                  
                  {publication.tags && publication.tags.length > 0 && (
                    <Flex gap="0.5rem" wrap="wrap" marginBottom="1rem">
                      {publication.tags.map((tag, idx) => (
                        <Badge key={idx} variation="success" size="small">{tag}</Badge>
                      ))}
                    </Flex>
                  )}
                  
                  {publication.publicationUrl && (
                    <Text marginTop="auto">
                      <a 
                        href={publication.publicationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--amplify-colors-blue-80)', textDecoration: 'none' }}
                      >
                        Read Publication →
                      </a>
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}
        </Collection>
        
        {filteredPublications.length === 0 && (
          <Text textAlign="center" padding="2rem">
            No publications found with the selected filter.
          </Text>
        )}
      </Container>
    </View>
  );
}