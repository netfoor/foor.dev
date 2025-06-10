'use client';

import { useState, useEffect } from 'react';
import { createAPIClient, configureAmplify } from '../amplify-client';

// Generic hook to fetch data from Amplify DataStore
export function useAmplifyData<T>(
  modelName: string,
  options: {
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filterFn?: (item: any) => boolean;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Make sure Amplify is configured in the client environment
      configureAmplify();
      const client = createAPIClient();
      
      try {
        setLoading(true);
        
        // Dynamically access the model
        if (!client.models[modelName]) {
          throw new Error(`Model ${modelName} not found`);
        }
        
        const response = await client.models[modelName].list();
        let resultData = response.data;
        
        // Apply sorting if specified
        if (options.sortBy) {
          resultData = resultData.sort((a: any, b: any) => {
            const aValue = a[options.sortBy as string];
            const bValue = b[options.sortBy as string];
            
            // Handle date sorting
            if (aValue && bValue && !isNaN(new Date(aValue).getTime()) && !isNaN(new Date(bValue).getTime())) {
              const comparison = new Date(bValue).getTime() - new Date(aValue).getTime();
              return options.sortDirection === 'asc' ? -comparison : comparison;
            }
            
            // Handle string sorting
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              const comparison = aValue.localeCompare(bValue);
              return options.sortDirection === 'asc' ? comparison : -comparison;
            }
            
            // Handle number sorting
            return options.sortDirection === 'asc' 
              ? Number(aValue) - Number(bValue)
              : Number(bValue) - Number(aValue);
          });
        }
        
        // Apply custom filter if provided
        if (options.filterFn) {
          resultData = resultData.filter(options.filterFn);
        }
        
        setData(resultData as T[]);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching ${modelName}:`, err);
        setError(err.message || `Failed to load ${modelName}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [modelName, options.sortBy, options.sortDirection]);

  return { data, loading, error };
}

// Utility functions that can be used across components
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

export const truncateText = (text: string, maxLength: number = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

// Helper function to extract unique values from an array of objects
export const getUniqueValues = (items: any[], key: string): string[] => {
  return Array.from(
    new Set(items.map(item => item[key]).filter(Boolean))
  ) as string[];
};
