'use client';

import Image from 'next/image';
import { Heading, Text, Flex, View } from '@aws-amplify/ui-react';
import { useAmplifyTheme } from './AmplifyWrapper';

export default function Hero() {
  const { colorMode } = useAmplifyTheme();
  
  console.log('Hero component: Current colorMode:', colorMode);
  
  return (
    <View 
      as="section"
      backgroundColor="background.primary"
      padding={{ base: "2rem", medium: "4rem" }}
      style={{
        height: "100vh",    
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: `var(--amplify-colors-background-primary)`
      }}
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        maxWidth="1200px"
        margin="0 auto"
      >
        <View width="150px" height="150px" marginBottom="1.5rem" position="relative" style={{ zIndex: 1 }}>
          <Image
            src="/images/profile.jpeg"
            alt="Fortino Romero Mantilla"
            className="rounded-full object-cover"
            fill
            priority
          />
        </View>        <Heading 
          level={1}
          color="font.primary"
          fontWeight="bold"
          marginBottom="0.5rem"
          textAlign="center"
          fontSize={{ base: '1.5rem', medium: '1.875rem', large: '2.25rem' }}
          style={{
            color: `var(--amplify-colors-font-primary)`
          }}
        >
          Fortino Romero Mantilla
        </Heading>

        <Text
          color="font.secondary"
          marginTop="0.5rem"
          marginBottom="2rem"
          textAlign="center"
          fontSize={{ base: '1rem', medium: '1.125rem' }}
          style={{
            color: `var(--amplify-colors-font-secondary)`
          }}
        >
          Cloud Engineer <span style={{margin: '0 0.5rem'}}>|</span> AWS Advocate <span style={{margin: '0 0.5rem'}}>|</span> DevOps Enthusiast
        </Text>

        <Flex
          direction="row"
          gap="2rem"
          marginTop="2rem"
          justifyContent="center"
        >
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.icons8.com/color/48/instagram-new--v1.png"
              alt="Instagram"
              width={32}
              height={32}
              style={{transition: 'transform 0.2s'}}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <a href="mailto:example@example.com">
            <img
              src="https://img.icons8.com/color/48/apple-mail.png"
              alt="Email"
              width={32}
              height={32}
              style={{transition: 'transform 0.2s'}}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.icons8.com/color/48/twitter--v1.png"
              alt="Twitter"
              width={32}
              height={32}
              style={{transition: 'transform 0.2s'}}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
        </Flex>
      </Flex>
    </View>
  );
}