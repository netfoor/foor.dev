// src/utils/amplify-client.ts
'use client';

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';
import amplifyconfig from '../../amplify_outputs.json';

// Ensure Amplify is only configured once on the client side
let isAmplifyConfigured = false;

// Configure Amplify on the client-side
export const configureAmplify = () => {
  if (typeof window !== 'undefined' && !isAmplifyConfigured) {
    try {
      Amplify.configure(amplifyconfig, { ssr: true });
      isAmplifyConfigured = true;
      console.log('Amplify configured successfully');
    } catch (error) {
      console.error('Error configuring Amplify:', error);
    }
  }
  return isAmplifyConfigured;
};

// Singleton API client instance
let apiClient: ReturnType<typeof generateClient<Schema>> | null = null;

// Create a typed API client (singleton pattern)
export const createAPIClient = () => {
  if (!apiClient) {
    configureAmplify(); // Ensure Amplify is configured
    apiClient = generateClient<Schema>();
  }
  return apiClient;
};

// Helper function to format dates for display
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Helper function to truncate text
export const truncateText = (text: string, maxLength: number = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};
