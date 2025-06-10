"use client"
import { Flex, Heading, Text, Card, Collection, Loader, View, Grid } from '@aws-amplify/ui-react';
import { useAmplifyData } from '../../utils/data-loader/common-data-hooks';

interface Language {
  id: string;
  name: string;
  proficiency: string;
  details?: string;
  certificates?: string[];
  speaking?: number;
  reading?: number;
  writing?: number;
  listening?: number;
}

export default function LanguagesClient() {
  // Use our custom hook to fetch data
  const { data: languages, loading, error } = useAmplifyData<Language>(
    'Languages',
    {
      // Sort by proficiency level with a custom filter function
      filterFn: (a, b) => {
        const proficiencyOrder = { 'Native': 0, 'Fluent': 1, 'Conversational': 2, 'Basic': 3 };
        return (proficiencyOrder[a.proficiency as keyof typeof proficiencyOrder] || 4) -
          (proficiencyOrder[b.proficiency as keyof typeof proficiencyOrder] || 4);
      }
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
        Error loading languages: {error}
      </Text>
    );
  }

  if (languages.length === 0) {
    return (
      <Text textAlign="center" padding="2rem">
        No language skills to display yet.
      </Text>
    );
  }

  // Function to render progress bars for language skills
  const renderSkillBar = (skill: number | undefined, label: string) => {
    if (skill === undefined) return null;
    
    return (
      <View marginBottom="0.75rem">
        <Flex justifyContent="space-between" marginBottom="0.25rem">
          <Text fontSize="small">{label}</Text>
          <Text fontSize="small">{skill}/10</Text>
        </Flex>
        <View
          backgroundColor="rgba(0,0,0,0.1)"
          borderRadius="4px"
          height="8px"
          width="100%"
        >
          <View
            backgroundColor="var(--amplify-colors-blue-60)"
            borderRadius="4px"
            height="8px"
            width={`${skill * 10}%`}
          />
        </View>
      </View>
    );
  };

  return (
    <View padding="1rem">
      <Heading level={2} marginBottom="1.5rem">Languages</Heading>

      <Collection
        items={languages}
        type="grid"
        templateColumns={{ base: '1fr', medium: '1fr 1fr' }}
        gap="1.5rem"
      >
        {(language, index) => (
          <Card key={index} variation="elevated" padding="1.5rem">
            <Flex direction="column">
              <Heading level={3}>{language.name}</Heading>
              <Text fontWeight="bold" marginBottom="1rem">
                {language.proficiency} {language.details && `• ${language.details}`}
              </Text>
              
              {/* Skill Bars */}
              <View marginBottom="1rem">
                {renderSkillBar(language.speaking, 'Speaking')}
                {renderSkillBar(language.reading, 'Reading')}
                {renderSkillBar(language.writing, 'Writing')}
                {renderSkillBar(language.listening, 'Listening')}
              </View>
              
              {/* Certificates */}
              {language.certificates && language.certificates.length > 0 && (
                <View marginTop="1rem">
                  <Text fontWeight="bold" marginBottom="0.5rem">Certificates:</Text>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {language.certificates.map((cert, i) => (
                      <li key={i}>{cert}</li>
                    ))}
                  </ul>
                </View>
              )}
            </Flex>
          </Card>
        )}
      </Collection>
    </View>
  );
}
