"use client"
import { Flex, Heading, Text, Card, Collection, Loader, View, Image, Grid } from '@aws-amplify/ui-react';
import { useAmplifyData, formatDate } from '../../utils/data-loader/common-data-hooks';

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  recognition?: string[];
  Photos?: string[];
  CertificateURL?: string;
}

export default function EducationClient() {
  // Use our custom hook to fetch data
  const { data: education, loading, error } = useAmplifyData<Education>(
    'Education',
    {
      sortBy: 'startDate',
      sortDirection: 'desc'
    }
  );

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
        Error loading education: {error}
      </Text>
    );
  }

  if (education.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No education history to display yet.
      </Text>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={2} marginBottom="1.5rem">Education</Heading>

      <Collection
        items={education}
        type="list"
        gap="2rem"
      >
        {(edu, index) => (
          <Card key={index} variation="elevated" padding="1.5rem">
            <Flex alignItems="flex-start" gap="1.5rem">
              {edu.Photos && edu.Photos.length > 0 && (
                <Image
                  src={edu.Photos[0]}
                  alt={edu.institution}
                  width="100px"
                  height="100px"
                  objectFit="cover"
                  borderRadius="8px"
                />
              )}
              <Flex direction="column" flex={1}>
                <Heading level={3}>{edu.degree}</Heading>
                <Text fontWeight="bold" marginBottom="0.5rem">
                  {edu.institution}
                  {edu.location && ` • ${edu.location}`}
                </Text>
                <Text marginBottom="0.5rem">
                  {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                </Text>
                
                {edu.description && (
                  <Text marginBottom="1rem">{edu.description}</Text>
                )}
                
                {edu.recognition && edu.recognition.length > 0 && (
                  <View marginBottom="1rem">
                    <Text fontWeight="bold" marginBottom="0.5rem">Achievements & Recognition:</Text>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {edu.recognition.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </View>
                )}
                
                {edu.CertificateURL && (
                  <Text marginTop="0.5rem">
                    <a 
                      href={edu.CertificateURL} 
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
            
            {edu.Photos && edu.Photos.length > 1 && (
              <Grid
                templateColumns={{ base: '1fr 1fr', medium: '1fr 1fr 1fr' }}
                gap="1rem"
                marginTop="1.5rem"
              >
                {edu.Photos.slice(1).map((photo: string, i: number) => (
                  <Image
                    key={i}
                    src={photo}
                    alt={`${edu.institution} photo ${i+1}`}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                    borderRadius="8px"
                  />
                ))}
              </Grid>
            )}
          </Card>
        )}
      </Collection>
    </View>
  );
}
