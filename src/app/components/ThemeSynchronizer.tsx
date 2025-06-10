'use client';

import { useEffect } from 'react';
import { useAmplifyTheme } from './AmplifyWrapper';

/**
 * This component doesn't render anything but ensures the theme
 * is applied to the document level and CSS variables
 */
export function ThemeSynchronizer() {
  const { colorMode } = useAmplifyTheme();
  useEffect(() => {
    // Apply the theme to the body element
    document.body.style.backgroundColor = 
      colorMode === 'dark' ? '#1a1a1a' : '#ffffff';
    document.body.style.color = 
      colorMode === 'dark' ? '#ffffff' : '#000000';
    
    // Set CSS custom properties for component styles
    document.documentElement.style.setProperty(
      '--amplify-colors-background-primary', 
      colorMode === 'dark' ? '#1a1a1a' : '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--amplify-colors-background-secondary', 
      colorMode === 'dark' ? '#2a2a2a' : '#f5f5f5'
    );
    document.documentElement.style.setProperty(
      '--amplify-colors-font-primary', 
      colorMode === 'dark' ? '#ffffff' : '#000000'
    );    document.documentElement.style.setProperty(
      '--amplify-colors-font-secondary', 
      colorMode === 'dark' ? '#a0a0a0' : '#666666'
    );
  }, [colorMode]);

  return null;
}
