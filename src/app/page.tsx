'use client';

import { Button, Heading, Text, Card, Flex, View } from '@aws-amplify/ui-react';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-2xl">
        <Heading level={1} className="text-center">Hola Next.js + Amplify UI</Heading>
        
        <Card variation="elevated" className="w-full">
          <Flex direction="column" alignItems="center" gap="1rem">
            <Text className="text-lg text-center">
              This page uses the Amplify UI theme with dark/light mode toggle
            </Text>
            
            <View backgroundColor="background.primary" padding="1rem" borderRadius="medium" width="100%">
              <Text>This background changes with the theme</Text>
            </View>
            
            <Button variation="primary">
              Amplify UI Button
            </Button>
          </Flex>
        </Card>
      </main>
    </div>
  );
}