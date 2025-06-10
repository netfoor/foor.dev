"use client"
import { useState, useEffect } from 'react';
import { Flex, Heading, Text, Card, Collection, Loader, View, Grid } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

export default function LanguagesClient() {
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const result = await client.models.Languages.list();
        // Sort by proficiency level
        const proficiencyOrder = { 'Native': 0, 'Fluent': 1, 'Conversational': 2, 'Basic': 3 };
        const sortedLanguages = result.data.sort((a, b) => 
          (proficiencyOrder[a.proficiency as keyof typeof proficiencyOrder] || 4) - 
          (proficiencyOrder[b.proficiency as keyof typeof proficiencyOrder] || 4)
        );
        setLanguages(sortedLanguages);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching languages:', err);
        setError(err.message || 'Failed to load languages');
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []);

  const getProficiencyColor = (proficiency: string) => {
    switch(proficiency) {
      case 'Native':
        return '#2da44e'; // green
      case 'Fluent':
        return '#0969da'; // blue
      case 'Conversational':
        return '#bf8700'; // yellow
      case 'Basic':
        return '#6e7781'; // gray
      default:
        return '#6e7781';
    }
  };

  const getProgressWidth = (proficiency: string) => {
    switch(proficiency) {
      case 'Native':
        return '100%';
      case 'Fluent':
        return '85%';
      case 'Conversational':
        return '60%';
      case 'Basic':
        return '30%';
      default:
        return '0%';
    }
  };

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
        Error loading languages: {error}
      </Text>
    );
  }

  if (languages.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No languages to display yet.
      </Text>
    );
  }

  return (
    <View padding="1rem">
      <Heading level={2} marginBottom="1.5rem">Languages</Heading>

      <Grid
        templateColumns={{ base: '1fr', medium: '1fr 1fr' }}
        gap="1.5rem"
      >
        {languages.map((language, index) => (
          <Card key={index} variation="elevated" padding="1.5rem">
            <Flex direction="column">
              <Flex justifyContent="space-between" alignItems="baseline" marginBottom="0.5rem">
                <Heading level={4}>{language.language}</Heading>
                <Text fontWeight="bold">{language.proficiency || 'Unspecified'}</Text>
              </Flex>
              
              <View 
                backgroundColor="#f6f8fa" 
                borderRadius="4px" 
                height="12px" 
                marginTop="0.5rem"
                position="relative"
              >
                <View 
                  backgroundColor={getProficiencyColor(language.proficiency)}
                  width={getProgressWidth(language.proficiency)}
                  height="100%"
                  borderRadius="4px"
                />
              </View>
            </Flex>
          </Card>
        ))}
      </Grid>
    </View>
  );
}
