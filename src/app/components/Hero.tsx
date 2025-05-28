'use client';

import Image from 'next/image';
import { Heading, Text, Flex, View } from '@aws-amplify/ui-react';

export default function Hero() {
  return (
    <View 
      as="section"
      backgroundColor={{ 
        light: "background.primary", 
        dark: "neutral.90" 
      }}
      className="min-h-screen flex flex-col items-center justify-center"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        padding={{ base: "2rem", medium: "4rem" }}
        width="100%"
        maxWidth="1200px"
        margin="0 auto"
      >
        <View className="w-36 h-36 md:w-40 md:h-40 relative mb-6">
          <Image
            src="/images/profile.jpeg"
            alt="Fortino Romero Mantilla"
            className="rounded-full object-cover"
            fill
            priority
          />
        </View>

        <Heading 
          level={1}
          color="secondary"
          fontWeight="bold"
          marginBottom="0.5rem"
          textAlign="center"
          className="text-2xl md:text-3xl lg:text-4xl"
        >
          Fortino Romero Mantilla
        </Heading>

        <Text
          variation="tertiary"
          className="text-md md:text-lg mt-2 mb-8"
          textAlign="center"
        >
          Cloud Engineer <span className="mx-2">|</span> AWS Advocate <span className="mx-2">|</span> DevOps Enthusiast
        </Text>

        {/* Íconos sociales con Amplify UI */}
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
              className="w-8 h-8 hover:scale-110 transition-transform"
            />
          </a>
          <a href="mailto:example@example.com">
            <img
              src="https://img.icons8.com/color/48/apple-mail.png"
              alt="Email"
              className="w-8 h-8 hover:scale-110 transition-transform"
            />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img
              src="https://img.icons8.com/color/48/twitter--v1.png"
              alt="Twitter"
              className="w-8 h-8 hover:scale-110 transition-transform"
            />
          </a>
        </Flex>
      </Flex>
    </View>
  );
}
