'use client';

import { useAmplifyTheme } from './AmplifyWrapper';
import { View, Text, Flex, Button } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';

export function ThemeDebugger() {
  const { colorMode, toggleTheme } = useAmplifyTheme();
  const [cssVars, setCssVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Get computed styles to check CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const vars = {
      '--amplify-colors-background-primary': computedStyle.getPropertyValue('--amplify-colors-background-primary'),
      '--amplify-colors-font-primary': computedStyle.getPropertyValue('--amplify-colors-font-primary'),
      'data-theme': document.documentElement.getAttribute('data-theme') || 'none',
      'class': document.documentElement.className,
      'body-background': getComputedStyle(document.body).backgroundColor,
    };
    
    setCssVars(vars);
  }, [colorMode]);
  
  return (
    <View
      backgroundColor="background.secondary"
      padding="1rem"
      borderRadius="0.5rem"
      margin="1rem"
      width="100%"
      maxWidth="500px"
      position="fixed"
      bottom="0"
      right="0"
      zindex="1000"
      boxShadow="0 0 10px rgba(0,0,0,0.2)"
    >
      <Text fontSize="1rem" fontWeight="bold" marginBottom="0.5rem">
        Theme Debugger
      </Text>
      
      <Flex direction="column" gap="0.5rem">
        <Text>Current Theme Mode: <strong>{colorMode}</strong></Text>
        <Text>HTML data-theme: <strong>{cssVars['data-theme']}</strong></Text>
        <Text>HTML classes: <strong>{cssVars['class']}</strong></Text>
        <Text>Body background: <strong>{cssVars['body-background']}</strong></Text>
        
        <View backgroundColor="background.tertiary" padding="0.5rem" borderRadius="0.25rem" marginTop="0.5rem">
          <Text fontWeight="bold">CSS Variables:</Text>
          <Text fontSize="0.8rem">--amplify-colors-background-primary: {cssVars['--amplify-colors-background-primary']}</Text>
          <Text fontSize="0.8rem">--amplify-colors-font-primary: {cssVars['--amplify-colors-font-primary']}</Text>
        </View>
        
        <Button 
          onClick={toggleTheme} 
          marginTop="1rem"
          variation="primary"
        >
          Toggle Theme (Current: {colorMode})
        </Button>
      </Flex>
    </View>
  );
}
