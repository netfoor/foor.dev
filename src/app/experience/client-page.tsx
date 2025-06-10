"use client"
import { Flex, Heading, Text, Card, Collection, Badge, Loader, View } from '@aws-amplify/ui-react';
import Container from '../components/Container';
import { useAmplifyData, formatDate } from '../../utils/data-loader/common-data-hooks';

interface Experience {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  activities?: string[];
  skills?: string[];
  type?: string;
}

export default function ExperienceClient() {
  // Use our custom hook to fetch data
  const { data: experiences, loading, error } = useAmplifyData<Experience>(
    'Experiences',
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
        Error loading experiences: {error}
      </Text>
    );
  }

  if (experiences.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No work experience to display yet.
      </Text>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={2} marginBottom="1.5rem">Work Experience</Heading>

      <Collection
        items={experiences}
        type="list"
        gap="2rem"
      >
        {(experience, index) => (
          <Card key={index} variation="elevated" padding="1.5rem">
            <Flex direction="column">
              <Heading level={3}>{experience.position}</Heading>
              <Text fontWeight="bold" marginBottom="0.5rem">
                {experience.company}
                {experience.location && ` • ${experience.location}`}
              </Text>
              <Text marginBottom="1rem">
                {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
              </Text>
              
              {experience.description && (
                <Text marginBottom="1rem">{experience.description}</Text>
              )}
              
              {experience.activities && experience.activities.length > 0 && (
                <View marginBottom="1rem">
                  <Text fontWeight="bold" marginBottom="0.5rem">Key Responsibilities:</Text>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {experience.activities.map((activity: string, i: number) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                </View>
              )}
              
              {experience.skills && experience.skills.length > 0 && (
                <View marginTop="1rem">
                  <Text fontWeight="bold" marginBottom="0.5rem">Skills:</Text>
                  <Flex wrap="wrap" gap="0.5rem">
                    {experience.skills.map((skill: string, i: number) => (
                      <Badge key={i} variation="info">
                        {skill}
                      </Badge>
                    ))}
                  </Flex>
                </View>
              )}
            </Flex>
          </Card>
        )}
      </Collection>
    </View>
  );
}
