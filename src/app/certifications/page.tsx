'use client';

import { CertificationsSection, getCertifications } from '@/app/components/certifications';
import { View, Heading, Text } from '@aws-amplify/ui-react';
import Container from '@/app/components/Container';

export default function CertificationsPage() {
  const allCertifications = getCertifications();

  return (
    <View className="flex flex-col min-h-screen">
      <View paddingTop="xl" paddingBottom="medium">
        <Container>
          <View textAlign="center" marginBottom="large">
            <Heading level={1} marginBottom="small">
              All Certifications & Training
            </Heading>
            <Text fontSize="medium" color="font.secondary" maxWidth="700px" margin="0 auto">
              A comprehensive overview of my professional development journey through 
              certified training programs and industry-recognized credentials.
            </Text>
          </View>
        </Container>
      </View>
      
      <CertificationsSection 
        certifications={allCertifications}
        showAll={true}
      />
    </View>
  );
}
