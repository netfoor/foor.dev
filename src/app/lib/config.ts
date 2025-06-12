import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../../../amplify_outputs.json';

let isInitialized = false;

export const initializeAmplify = () => {
  if (typeof window === 'undefined') {
    console.log('Amplify configuration skipped (server-side).');
    return;
  }

  if (isInitialized) {
    console.log('Amplify already initialized.');
    return;
  }

  try {
    Amplify.configure(amplifyOutputs, { ssr: true });
    isInitialized = true;
    console.log('Amplify configured successfully.');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
};
