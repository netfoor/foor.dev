"use client"
import { useState, useMemo } from 'react';
import { 
  Flex, 
  Heading, 
  Text, 
  Card, 
  Collection, 
  Badge, 
  Loader, 
  View, 
  Image,
  Button
} from '@aws-amplify/ui-react';
import Container from '../components/Container';
import { useAmplifyData, formatDate, getUniqueValues } from '../../utils/data-loader/common-data-hooks';

// Define the type for recognition items
interface Recognition {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  type?: string;
  description?: string;
  badgeImageUrl?: string;
  credentialId?: string;
  issuerUrl?: string;
}

export default function RecognitionsClient() {
  const [activeType, setActiveType] = useState('all');
  
  // Use our custom hook to fetch data
  const { data: recognitions, loading, error } = useAmplifyData<Recognition>(
    'Recognitions',
    {
      sortBy: 'issueDate',
      sortDirection: 'desc'
    }
  );

  // Get all unique types for filtering
  const recognitionTypes = useMemo(() => 
    getUniqueValues(recognitions, 'type'), 
    [recognitions]
  );

  // Filter recognitions by type
  const filteredRecognitions = useMemo(() => {
    if (activeType === 'all') {
      return recognitions;
    }
    return recognitions.filter(item => item.type === activeType);
  }, [recognitions, activeType]);
  // Define type tabs for filtering
  const typeTabs = useMemo(() => {
    const allTab = { value: 'all', label: 'All Awards', count: recognitions.length };
    const typeTabs = recognitionTypes.map(type => ({
      value: type,
      label: type,
      count: recognitions.filter(item => item.type === type).length
    }));
    
    return [allTab, ...typeTabs];
  }, [recognitions, recognitionTypes]);

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
        Error loading recognitions: {error}
      </Text>
    );
  }

  if (recognitions.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No recognitions to display yet.
      </Text>
    );
  }
  return (
    <View className="flex flex-col min-h-screen">
      <View paddingTop="xl" paddingBottom="medium">
        <Container>
          <View textAlign="center" marginBottom="large">
            <Heading level={1} marginBottom="small">
              Awards & Recognitions
            </Heading>
            <Text fontSize="medium" color="font.secondary" maxWidth="700px" margin="0 auto">
              Achievements, awards, and formal recognition received for contributions to 
              technology, research, and innovation.
            </Text>
          </View>
        </Container>
      </View>

      <Container>
        {/* Type Filter Tabs */}
        {recognitionTypes.length > 0 && (
          <Flex 
            justifyContent="center" 
            marginBottom="large" 
            gap="small"
            wrap="wrap"
          >
            {typeTabs.map((tab) => (
              <Button
                key={tab.value}
                variation={activeType === tab.value ? 'primary' : 'link'}
                onClick={() => setActiveType(tab.value)}
                backgroundColor={activeType === tab.value ? 'var(--amplify-colors-primary-80)' : undefined}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </Flex>
        )}

        {/* Recognitions Collection */}
        <Collection
          items={filteredRecognitions}
          type="list"
          gap="1.5rem"
          marginBottom="2rem"
        >
          {(recognition, index) => (
            <Card key={index} variation="elevated" padding="1.5rem">
              <Flex alignItems="flex-start" gap="1.5rem" wrap={{ base: 'wrap', medium: 'nowrap' }}>
                {recognition.badgeImageUrl && (
                  <View width={{ base: '100%', medium: '120px' }} textAlign={{ base: 'center', medium: 'left' }} marginBottom={{ base: '1rem', medium: '0' }}>
                    <Image
                      src={recognition.badgeImageUrl}
                      alt={recognition.title}
                      width={{ base: '120px', medium: '120px' }}
                      height="120px"
                      objectFit="contain"
                    />
                  </View>
                )}
                <Flex direction="column" flex={1}>
                  <Heading level={3}>{recognition.title}</Heading>
                  <Text fontWeight="bold" marginBottom="0.5rem">
                    {recognition.issuer}
                    {recognition.issueDate && ` • ${formatDate(recognition.issueDate)}`}
                  </Text>
                  {recognition.type && (
                    <Badge 
                      variation="info" 
                      marginBottom="0.5rem"
                    >
                      {recognition.type}
                    </Badge>
                  )}
                  {recognition.credentialId && (
                    <Text marginBottom="0.5rem">
                      <strong>Credential ID:</strong> {recognition.credentialId}
                    </Text>
                  )}
                  <Text>{recognition.description}</Text>
                  
                  {recognition.issuerUrl && (
                    <Text marginTop="1rem">
                      <a 
                        href={recognition.issuerUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--amplify-colors-blue-80)', textDecoration: 'none' }}
                      >
                        View Certificate →
                      </a>
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Card>
          )}
        </Collection>
        
        {filteredRecognitions.length === 0 && (
          <Text textAlign="center" padding="2rem">
            No recognitions found in this category.
          </Text>
        )}
      </Container>
    </View>
  );
}
